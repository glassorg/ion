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
    // console.log(argTypes.join(","));
    const paramNamesToIndex = new Map(parameters.map((p,i) => [getSSAOriginalName(p.id.name), i]));
    // const DEBUG = argTypes.join(",") == "Array<Float>,Integer{(@ < `from:1:0`.length),(@ < `to:1:0`.length),(@ >= 0)}";
    // if (DEBUG) {
    //     console.log({
    //         ...Object.fromEntries(args.map((a,i) => [`arg[${i}]`, a.toString()])),
    //         ...Object.fromEntries(argTypes.map((a,i) => [`argType[${i}]`, a.toString()])),
    //         ...Object.fromEntries(paramTypes.map((a,i) => [`paramType[${i}]`, a.toString()])),
    //         paramNamesToIndex: JSON.stringify(Object.fromEntries(paramNamesToIndex.entries())),
    //     });
    // }
    let allTrue = true;
    for (let i = 0; i < argTypes.length; i++) {
        const argType = argTypes[i];
        // replace placeholder argTypes with correct parameter type.
        const paramTypeRaw = traverse(paramTypes[i], {
            leave(node) {
                if (node instanceof Reference) {
                    const name = getSSAOriginalName(node.name);
                    const paramIndex = paramNamesToIndex.get(name) ?? -1;
                    if (paramIndex >= 0) {
                        return argTypes[paramIndex];
                    }
                }
            }
        });
        let paramType = simplify(paramTypeRaw);
        let result = isSubTypeOf(argType, paramType);
        if (result === null) {
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
            const paramNames = parameters.map(param => param.id.name);
            const argNames = new Map(args.map((p,i) => [p instanceof Reference ? getSSAOriginalName(p.name) : "",i]));
            const normalizedArgType = traverse(argType, {
                leave(node) {
                    if (node instanceof Reference) {
                        const index = argNames.get(getSSAOriginalName(node.name));
                        if (index != null) {
                            return node.patch({ name: paramNames[index]});
                        }
                    }
                }
            });
            paramType = paramTypes[i];  //  we don't use the raw replaced value here.
            const newResult = isSubTypeOf(normalizedArgType, paramType);
            // if (DEBUG) {
            //     const paramKype = paramType.toKype();
            //     const simpleParamType = simplify(paramType);
            //     console.log({
            //         argType: argType.toString(),
            //         normalizedArgType: normalizedArgType.toString(),
            //         paramType: paramType.toString(),
            //         paramKype: paramKype.toString(),
            //         simpleParamType: simpleParamType.toString(),
            //         result,
            //         newResult,
            //     })
            // }
            result = newResult;
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