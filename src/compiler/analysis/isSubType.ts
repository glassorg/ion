import * as kype from "@glas/kype";
import { traverse } from "@glas/traverse";
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