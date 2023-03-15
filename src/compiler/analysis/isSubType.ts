import * as kype from "@glas/kype";
import { isAlways, Maybe } from "@glas/kype";
import { traverse } from "@glas/traverse";
import { isNever, Type } from "../ast/Type";

/**
 * Returns true if this is a subtype, false if it's definitly never a subtype or null if it might be a subtype.
 */
export function isSubTypeOf(maybeSubType: Type, superType: Type) {
    if (isNever(maybeSubType) || isNever(superType)) {
        return false;
    }
    if (isAlways(maybeSubType) || isAlways(superType)) {
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
 * Returns true if all types are subtypes of the supertypes.
 * Returns false if any types are never subtypes of the supertypes.
 * Returns null otherwise.
 */
export function areSubTypesOf(maybeSubTypes: Type[], superTypes: Type[]): Maybe {
    if (maybeSubTypes.length !== superTypes.length) {
        return false;
    }
    let allTrue = true;
    for (let i = 0; i < maybeSubTypes.length; i++) {
        let maybeSubType = maybeSubTypes[i];
        let superType = superTypes[i];
        switch (isSubTypeOf(maybeSubType, superType)) {
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