import * as kype from "@glas/kype";
import { Maybe } from "@glas/kype";
import { traverse } from "@glas/traverse";
import { ArgPlaceholder } from "../ast/ArgPlaceholder";
import { Expression } from "../ast/Expression";
import { Reference } from "../ast/Reference";
import { isAny, isNever, Type } from "../ast/Type";
import { ParameterDeclaration } from "../ast/VariableDeclaration";
import { getSSAOriginalName } from "../common/ssa";
import { simplify } from "./simplify";

/**
 * Returns true if this is a subtype, false if it's definitly never a subtype or null if it might be a subtype.
 */
export function isSubTypeOf(maybeSubType: Type, superType: Type) {
    if (isNever(maybeSubType) || isNever(superType)) {
        return false;
    }
    if (isAny(maybeSubType) || isAny(superType)) {
        return true;
    }
    const kypeSubType = removeKypeTypeExpressions(maybeSubType.toKype());
    const kypeSuperType = removeKypeTypeExpressions(superType.toKype());
    const result = kype.isConsequent(kypeSubType, kypeSuperType);
    return result;
}

function removeKypeTypeExpressions(root: kype.Expression) {
    return traverse(root, {
        leave(node) {
            if (node instanceof kype.TypeExpression) {
                return node.proposition;
            }
        }
    })
}

/**
 * Returns true if all argTypes are subtypes of the paramTypes.
 * Returns false if any argTypes are never subtypes of the paramTypes.
 * Returns null otherwise.
 */
export function areValidParameters(args: Expression[], parameters: ParameterDeclaration[]): Maybe {
    if (args.length !== parameters.length) {
        return false;
    }
    const argTypes = args.map(arg => arg.type!);
    const paramTypes = parameters.map(p => p.type!);
    const DEBUG = paramTypes.join(",").indexOf("@arg") >= 0;
    let allTrue = true;
    for (let i = 0; i < argTypes.length; i++) {
        const argType = argTypes[i];
        // replace placeholder argTypes with correct parameter type.
        const paramTypeRaw = traverse(paramTypes[i], {
            leave(node) {
                if (node instanceof ArgPlaceholder) {
                    return argTypes[node.index];
                }
            }
        });
        const paramType = simplify(paramTypeRaw);
        let result = isSubTypeOf(argType, paramType);
        if (result === null) {
            if (DEBUG) {
                //  replace any reference to an identifier with same name as a known argument
                //  with an arg placeholder and then recompare if this is a subType.
                //  this solves situations like the following:
                //
                //  function callWithLarger(a: >= 0, b, > a) ->
                //  function caller(x: Integer, y: Integer) ->
                //      if y >= x
                //          return callWithLarger(x, y)
                //      return 0
                //
                //  the 2nd parameterType will be Integer{ @ > @arg(0) }
                //  the 2nd argumentType will be Integer{ @ > x:ssa }
                //  after normalizing the 2nd argumentType will be Integer{ @ > @arg(0) }
                const argNames = new Map(args.map((p,i) => [p instanceof Reference ? getSSAOriginalName(p.name) : "",i]));
                const normalizedArgType = traverse(argType, {
                    leave(node) {
                        if (node instanceof Reference) {
                            const index = argNames.get(getSSAOriginalName(node.name));
                            if (index != null) {
                                return new ArgPlaceholder(node.location, index);
                            }
                        }
                    }
                })
                const newResult = isSubTypeOf(normalizedArgType, paramTypes[i]);
                // console.log({
                //     argType: argType.toString(),
                //     normalizedArgType: normalizedArgType.toString(),
                //     paramTypeBefore: paramTypes[i].toString(),
                //     // paramTypeRaw: paramTypeRaw.toString(),
                //     // paramType: paramType.toString(),
                //     result,
                //     newResult,
                // })
                result = newResult;
            }
        }
        switch (result) {
            case false:
                return false;
            case null:
                allTrue = false;
                //  fall through
            case true:
                continue;
        }
    }
    return allTrue ? true : null;
}

export function getSubTypePercentage(maybeSubTypes: Type[], superTypes: Type[]): number {
    if (maybeSubTypes.length !== superTypes.length) {
        return 0;
    }
    let subtypes = 0;
    for (let i = 0; i < maybeSubTypes.length; i++) {
        let maybeSubType = maybeSubTypes[i];
        let superType = superTypes[i];
        if (isSubTypeOf(maybeSubType, superType)) {
            subtypes++;
        }
    }
    return subtypes / maybeSubTypes.length;
}