import * as kype from "@glas/kype";
import { Maybe } from "@glas/kype";
import { traverse } from "@glas/traverse";
import { ArgPlaceholder } from "../ast/ArgPlaceholder";
import { isAny, isNever, Type } from "../ast/Type";

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
    // console.log(`isSubType ${kypeSubType} --> ${kypeSuperType} = ${result}`);
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
export function areValidParameters(argTypes: Type[], paramTypes: Type[]): Maybe {
    if (argTypes.length !== paramTypes.length) {
        return false;
    }
    let allTrue = true;
    for (let i = 0; i < argTypes.length; i++) {
        let argType = argTypes[i];
        const debug = paramTypes[i].toString().indexOf("@arg") > 0;
        // replace placeholder argTypes with correct parameter type.
        let paramType = traverse(paramTypes[i], {
            leave(node) {
                if (node instanceof ArgPlaceholder) {
                    return argTypes[node.index];
                }
            }
        });
        if (debug) {
            console.log(`${argType} -> ${paramType}`);
        }
        switch (isSubTypeOf(argType, paramType)) {
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