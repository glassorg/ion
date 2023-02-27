import * as kype from "@glas/kype";
import { Type } from "../ast/Type";

/**
 * Returns true if this is a subtype, false if it's definitly never a subtype or null if it might be a subtype.
 */
export function isSubTypeOf(maybeSubType: Type, superType: Type) {
    const kypeSubType = maybeSubType.toKype();
    const kypeSuperType = superType.toKype();
    const result = kype.isConsequent(kypeSubType, kypeSuperType);
    // console.log(`isSubType ${kypeSubType} --> ${kypeSuperType} = ${result}`);
    return result;
}