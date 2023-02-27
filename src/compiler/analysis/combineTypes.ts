import * as kype from "@glas/kype";
import { Expression } from "../ast/Expression";
import { Type } from "../ast/Type";
import { kypeToTypeExpression, toExpression } from "./kypeToTypeExpression";

export function combineTypes(operator: "&&" | "||", types: Type[]): Type {
    let type = types[0].toKype();
    for (let i = 1; i < types.length; i++) {
        type = kype.combineTypes(type, operator, types[i].toKype());
    }
    return kypeToTypeExpression(type, types[0].location) as Type;
}

export function simplify(type: Type): Type
export function simplify(type: Expression): Expression
export function simplify(type: Type | Expression): Type | Expression {
    let newKypeType = kype.simplify(type.toKype());
    return toExpression(newKypeType, type.location);
}
