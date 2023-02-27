import * as kype from "@glas/kype";
import { TypeInterface } from "../ast/TypeExpression";
import { kypeToTypeExpression } from "./kypeToTypeExpression";

export function combineTypes(operator: "&&" | "||", types: TypeInterface[]) {
    let type = types[0].toKypeType();
    for (let i = 1; i < types.length; i++) {
        type = kype.combineTypes(type, operator, types[i].toKypeType());
    }
    return kypeToTypeExpression(type, types[0].location);
}

export function simplifyType(type: TypeInterface) {
    let kypeType = type.toKypeType();
    let newKypeType = kype.simplify(kypeType) as kype.TypeExpression;
    return kypeToTypeExpression(newKypeType, type.location);
}
