import { Expression } from "../ast/Expression";
import { ParameterDeclaration } from "../ast/VariableDeclaration";
import { CallExpression } from "../ast/CallExpression";
import { EvaluationContext } from "../EvaluationContext";
import { getSSAOriginalName } from "../common/ssa";
import { traverse } from "../common/traverse";
import { Reference } from "../ast/Reference";
import { ArgPlaceholder } from "../ast/ArgPlaceholder";
import { Maybe } from "@glas/kype";
import { ConstrainedType } from "../ast/ConstrainedType";
import { joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { DotExpression } from "../ast/DotExpression";
import { isTypeName } from "../common/names";
import { TypeReference } from "../ast/TypeReference";
import { splitFilterJoinMultiple } from "../common/utility";

/**
 * Returns true if all argTypes are subtypes of the paramTypes.
 * Returns false if any argTypes are never subtypes of the paramTypes.
 * Returns null otherwise.
 */
export function areValidArguments2(c: EvaluationContext, args: Expression[], parameters: ParameterDeclaration[], callee: CallExpression): Maybe {
    if (args.length !== parameters.length) {
        return false;
    }
    const argTypes = args.map(arg => arg.type!);

    // normalized parameter types
    const nParamTypes = getNormalizedParameterTypes(parameters);

    const referenced = new Set<string>();
    const known = joinExpressions(
        "&&",
        args.map((arg, i) => getNormalizedArgumentPropositions(
            c, arg, new ArgPlaceholder(arg.location, i), referenced
        ))
    );

    console.log({
        ...Object.fromEntries(args.map((a, i) => [`arg[${i}]`, a.toString()])),
        ...Object.fromEntries(argTypes.map((a, i) => [`argType[${i}]`, a.toString()])),
        ...Object.fromEntries(argTypes.map((a, i) => [`argType[${i}]`, a.toString()])),
        ...Object.fromEntries(nParamTypes.map((a, i) => [`nParamType[${i}]`, a.toString()])),
        ...Object.fromEntries(splitExpressions("&&", known).map((a, i) => [`known[${i}]`, a.toString()])),
    });
    return null;
}

/**
 * @param arg the argument to get normalized propositions for.
 * @param replace the expression to replace DotExpressions with.
 * @param referenced referenced expressions that have already been converted to propositions.
 * @returns a combined resulting Expression of all propositions.
 */
export function getNormalizedArgumentPropositions(c: EvaluationContext, arg: Expression, replace: Expression, referenced: Set<string>) : Expression {
    const foundReferences = new Map<string,Reference>();
    let proposition = splitFilterJoinMultiple(arg.type!, ["|", "&"], ["||", "&&"], (type => {
        if (type instanceof TypeReference) {
            return new ComparisonExpression(arg.location, replace, "is", type);
        }
        return traverse(type, {
            leave(node) {
                if (node instanceof DotExpression) {
                    return replace;
                }
                if (node instanceof ConstrainedType) {
                    return joinExpressions("&&", [
                        new ComparisonExpression(node.location, replace, "is", node.baseType),
                        ...node.constraints
                    ]);
                }
                if (node instanceof Reference) {
                    if (!isTypeName(node.name)) {
                        foundReferences.set(node.name, node);
                    }
                }
            }
        }) as Expression;
    }))
    for (const ref of foundReferences.values()) {
        if (!referenced.has(ref.name)) {
            referenced.add(ref.name);
            const refPropositions = getNormalizedArgumentPropositions(c, ref, ref, referenced);
            proposition = joinExpressions("&&", [proposition, refPropositions]);
        }
    }
    console.log("--> " + arg + " ===> " + proposition);
    return proposition;
}

export function getNormalizedParameterTypes(parameters: ParameterDeclaration[]) {
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
    }) as Expression[];

    return nParamTypes;
}