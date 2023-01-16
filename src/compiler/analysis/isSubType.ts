import { TypeExpression } from "../ast/TypeExpression";
import * as kype from "@glas/kype";

/**
 * Returns true if this is a subtype, false if it's definitly never a subtype or null if it might be a subtype.
 */
export function isSubType(subType: TypeExpression, superType: TypeExpression) {
    const kypeSubType = subType.toKype();
    const kypeSuperType = superType.toKype();
    const result = kype.isConsequent(kypeSubType, kypeSuperType);
    console.log(`isSubType ${kypeSubType} --> ${kypeSuperType} = ${result}`);
    return result;
}