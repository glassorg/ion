import * as kype from "@glas/kype";
import { TypeExpression } from "../ast/TypeExpression";

/**
 * Returns true if this is a subtype, false if it's definitly never a subtype or null if it might be a subtype.
 */
export function isSubTypeOf(maybeSubType: TypeExpression, superType: TypeExpression) {
    const kypeSubType = maybeSubType.toKypeType();
    const kypeSuperType = superType.toKypeType();
    const result = kype.isConsequent(kypeSubType, kypeSuperType);
    // console.log(`isSubType ${kypeSubType} --> ${kypeSuperType} = ${result}`);
    return result;
}