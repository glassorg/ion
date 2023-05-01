import { Expression } from "../ast/Expression";
import { ParameterDeclaration } from "../ast/VariableDeclaration";
import { CallExpression } from "../ast/CallExpression";
import { EvaluationContext } from "../EvaluationContext";
import { getSSAOriginalName, isSSAVersionName } from "../common/ssa";
import { skip, traverse } from "../common/traverse";
import { Reference } from "../ast/Reference";
import { ArgPlaceholder } from "../ast/ArgPlaceholder";
import { Maybe, isConsequent } from "@glas/kype";
import { ConstrainedType } from "../ast/ConstrainedType";
import { joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression } from "../ast/DotExpression";
import { Type } from "../ast/Type";
import { BinaryExpression } from "../ast/BinaryExpression";
import { Identifier } from "../ast/Identifier";
import { Resolvable } from "../ast/Resolvable";
import { FunctionExpression } from "../ast/FunctionExpression";

export function removeSSANames<T = unknown>(root: T): T {
    return traverse(root, {
        leave(node) {
            if (node instanceof Reference || node instanceof Identifier) {
                const { name } = node;
                if (isSSAVersionName(name)) {
                    return node.patch({ name: getSSAOriginalName(name) });
                }
            }
        }
    })
}

export function replaceReferences<T = unknown>(root: T, replacements: Map<string,Expression>): T {
    return traverse(root, {
        leave(node) {
            if (node instanceof Reference) {
                const { name } = node;
                return replacements.get(name);
            }
        }
    })
}

/**
 * Returns true if all argTypes are subtypes of the paramTypes.
 * Returns false if any argTypes are never subtypes of the paramTypes.
 * Returns null otherwise.
 */
export function areValidArguments(c: EvaluationContext, args: Expression[], parameters: ParameterDeclaration[], caller: CallExpression, DEBUG = false): Maybe {
    if (args.length !== parameters.length) {
        return false;
    }

    const argTypes = args.map(arg => arg.type!);

    const callSiteFunction = c.lookup.findAncestor(caller, FunctionExpression)!;
    //  propositions known from the call site functions parameter preconditions.
    const knownFromCall = joinExpressions("&&", callSiteFunction.parameters.map((p, i) => flattenType(p.type!, new Reference(p.location, p.id.name))));
    //  propositions known from the types of the arguments
    const knownFromArgs = normalizeArguments(args);
    const known = replaceReferences(removeSSANames(joinExpressions("&&", [knownFromCall, knownFromArgs].filter(a => a))), new Map(removeSSANames(args).map((a, i) => [a.toString(), new ArgPlaceholder(a.location, i)])));

    const check = replaceReferences(normalizeArguments(parameters), new Map(parameters.map((p,i) => [p.id.name, new ArgPlaceholder(p.location, i)])));


    const knownKype = known.toKype();
    const checkKype = check.toKype();
    const result = isConsequent(knownKype, checkKype);

    if (DEBUG) {
        console.log({
            ...Object.fromEntries(args.map((a, i) => [`arg[${i}]`, a.toString()])),
            ...Object.fromEntries(argTypes.map((a, i) => [`argType[${i}]`, a.toString()])),
            ...Object.fromEntries(splitExpressions("&&", knownFromArgs).map((a, i) => [`knownFromArgs[${i}]`, a.toString()])),
            ...Object.fromEntries(splitExpressions("&&", knownFromCall).map((a, i) => [`knownFromCall[${i}]`, a.toString()])),
            ...Object.fromEntries(splitExpressions("&&", known).map((a, i) => [`known[${i}]`, a.toString()])),
            ...Object.fromEntries(splitExpressions("&&", check).map((a, i) => [`check[${i}]`, a.toString()])),
            ...Object.fromEntries(knownKype.split("&&").map((a, i) => [`knownKype[${i}]`, a.toString()])),
            ...Object.fromEntries(checkKype.split("&&").map((a, i) => [`checkKype[${i}]`, a.toString()])),
            result,
        });
    }

    return result;
}

function normalizeArguments(expressions: Resolvable[]) {
    return joinExpressions("&&", expressions.map((e, i) => flattenType(e.type!, new ArgPlaceholder(e.location, i))));
}

function flattenType(type: Type, replacement: Expression): Expression {
    if (type instanceof ConstrainedType) {
        return joinExpressions("&&", [
            flattenType(type.baseType, replacement),
            ...replaceDotExpressions(type.constraints, replacement)
        ]);
    }
    else {
        return new ComparisonExpression(type.location, replacement, "is", type);
    }
}

/**
 * Flattens all `x is Integer{ > 0 }` expressions into the form of `x is Integer && x > 0`
 */
function replaceDotExpressions<T>(root: T, replacement: Expression): T {
    function shouldFlatten(node: unknown): node is BinaryExpression & { right: Type } {
        return node instanceof BinaryExpression && node.operator === "is";
    }
    return traverse(root, {
        enter(node): any {
            if (shouldFlatten(node)) {
                return skip;
            }
        },
        leave(node): any {
            if (shouldFlatten(node)) {
                return flattenType(node.right, replaceDotExpressions(node.left, replacement));
            }
            if (node instanceof DotExpression) {
                return replacement;
            }
        }
    })
}
