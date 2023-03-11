import * as kype from "@glas/kype";
import { Expression } from "../ast/Expression";
import { Type } from "../ast/Type";
import { toIonExpression } from "./kypeToTypeExpression";

export function simplify(type: Type): Type
export function simplify(type: Expression): Expression
export function simplify(type: Type | Expression): Type | Expression {
    // we are losing generics during simplification.
    let newKypeType = type.toKype();
    newKypeType = kype.simplify(newKypeType);
    let result = toIonExpression(newKypeType, type.location);
    return result;
}
