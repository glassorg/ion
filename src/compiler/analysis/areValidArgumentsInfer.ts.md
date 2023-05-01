import { Expression } from "../ast/Expression";
import { ParameterDeclaration } from "../ast/VariableDeclaration";
import { CallExpression } from "../ast/CallExpression";
import { EvaluationContext } from "../EvaluationContext";
import { getSSAOriginalName } from "../common/ssa";
import { skip, traverse } from "../common/traverse";
import { Reference } from "../ast/Reference";
import { ArgPlaceholder } from "../ast/ArgPlaceholder";
import { Maybe, isConsequent } from "@glas/kype";
import { ConstrainedType } from "../ast/ConstrainedType";
import { joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression } from "../ast/DotExpression";
import { isTypeName } from "../common/names";
import { TypeReference } from "../ast/TypeReference";
import { splitFilterJoinMultiple } from "../common/utility";
import { Type } from "../ast/Type";
import { BinaryExpression } from "../ast/BinaryExpression";
import { FunctionExpression } from "../ast/FunctionExpression";

/**
 * Returns true if all argTypes are subtypes of the paramTypes.
 * Returns false if any argTypes are never subtypes of the paramTypes.
 * Returns null otherwise.
 */
export function areValidArguments2(c: EvaluationContext, args: Expression[], parameters: ParameterDeclaration[], caller: CallExpression, DEBUG = false): Maybe {
    if (args.length !== parameters.length) {
        return false;
    }

    // get what we can know based upon parameter types within the function we are calling FROM.
    const argLookupByString = new Map(args.map((arg, i) => [arg.toString(), new ArgPlaceholder(arg.location, i)]));
    const callSiteFunction = c.lookup.findAncestor(caller, FunctionExpression)!;
    const knownCallSiteProps = getNormalizedArgumentsPropositions(
        c,
        callSiteFunction.parameterTypes,
        callSiteFunction.parameters.map((p, i) => new Reference(p.location, p.id.name))
    );
    const argTypes = args.map(arg => arg.type!);
    const knownFromArguments = getNormalizedArgumentsPropositions(c, argTypes);
    const knownBefore = joinExpressions("&&", [knownCallSiteProps, knownFromArguments]);
    const known = traverse(knownBefore, {
        // replace any instances of our arguments with a normalized arg placeholder.
        leave(node) { if (node instanceof Expression) { return argLookupByString.get(node.toString()); } }
    }) as Expression;
    const knownKype = known.toKype();

    const check = getNormalizedArgumentsPropositions(c, getNormalizedParameterTypes(parameters))
    const checkKype = check.toKype();
    
    const result = isConsequent(knownKype, checkKype);

    if (DEBUG) {
        console.log({
            ...Object.fromEntries(args.map((a, i) => [`arg[${i}]`, a.toString()])),
            ...Object.fromEntries(argTypes.map((a, i) => [`argType[${i}]`, a.toString()])),
            ...Object.fromEntries(splitExpressions("&&", knownCallSiteProps).map((a, i) => [`knownCallSite[${i}]`, a.toString()])),
            ...Object.fromEntries(splitExpressions("&&", knownFromArguments).map((a, i) => [`knownFromArgs[${i}]`, a.toString()])),
            ...Object.fromEntries(splitExpressions("&&", known).map((a, i) => [`known[${i}]`, a.toString()])),
            ...Object.fromEntries(splitExpressions("&&", check).map((a, i) => [`check[${i}]`, a.toString()])),
            ...Object.fromEntries(knownKype.split("&&").map((a, i) => [`knownKype[${i}]`, a.toString()])),
            ...Object.fromEntries(checkKype.split("&&").map((a, i) => [`checkKype[${i}]`, a.toString()])),
            result,
        });
    }

    return result;
}

export function getNormalizedArgumentsPropositions(
    c: EvaluationContext,
    argTypes: Type[],
    replacements: Expression[] = argTypes.map((a, i) => new ArgPlaceholder(a.location, i))
) {
    const referenced = new Set<string>();
    return joinExpressions(
        "&&",
        argTypes.map((argType, i) => {
            const result = getNormalizedArgumentPropositions(
                c, argType, replacements[i], referenced
            )
            return result;
        })
    );
}

/**
 * @param arg the argument to get normalized propositions for.
 * @param replacement the expression to replace DotExpressions with.
 * @param referenced referenced expressions that have already been converted to propositions.
 * @returns a combined resulting Expression of all propositions.
 */
function getNormalizedArgumentPropositions(c: EvaluationContext, argType: Expression, replacement: Expression, referenced: Set<string>) : Expression {
    const foundReferences = new Map<string,Reference>();
    function replaceRecursive(root: Expression): Expression {
        return traverse(root, {
            enter(node, ancestors) {
                if (node instanceof BinaryExpression && node.operator === "is") {
                    //  we skip the BinaryExpression,
                    //  we will have to handle the left, but NOT the right.
                    return skip;
                }
            },
            leave(node) {
                if (node instanceof BinaryExpression && node.operator === "is") {
                    // recurse.
                    const newLeft = replaceRecursive(node.left);
                    return getNormalizedArgumentPropositions(c, node.right, newLeft, referenced);
                }
                if (node instanceof DotExpression) {
                    return replacement;
                }
                if (node instanceof ConstrainedType) {
                    return joinExpressions("&&", [
                        new ComparisonExpression(node.location, replacement, "is", node.baseType),
                        ...node.constraints
                    ]);
                }
                if (node instanceof Reference) {
                    if (!isTypeName(node.name)) {
                        foundReferences.set(node.name, node);
                    }
                }
                return node;                
            }
        }) as Expression;        
    }
    let proposition = splitFilterJoinMultiple(argType!, ["|", "&"], ["||", "&&"], (type => {
        if (type instanceof TypeReference) {
            return new ComparisonExpression(argType.location, replacement, "is", type);
        }
        return replaceRecursive(type);
    }))
    for (const ref of foundReferences.values()) {
        if (!referenced.has(ref.name)) {
            referenced.add(ref.name);
            if (ref.type) {
                const refPropositions = getNormalizedArgumentPropositions(c, ref.type, ref, referenced);
                proposition = joinExpressions("&&", [proposition, refPropositions]);
            }
            else {
                console.log(`ref is not typed??? ${ref}`)
            }
        }
    }
    return proposition;
}

export function getNormalizedParameterTypes(parameters: ParameterDeclaration[]): Type[] {
    const paramTypes = parameters.map(p => p.type!);
    const paramNamesToIndex = new Map(parameters.map((p, i) => [getSSAOriginalName(p.id.name), i]));

    // normalize parameter types
    const nParamTypes = traverse(paramTypes, {
        leave(node) {
            if (node instanceof Reference) {
                const name = getSSAOriginalName(node.name);
                const paramIndex = paramNamesToIndex.get(name) ?? -1;
                if (paramIndex >= 0) {
                    return new ArgPlaceholder(node.location, paramIndex);
                }
            }
        }
    }) as Type[];

    return nParamTypes;
}