import * as kype from "@glas/kype";
import { splitExpressions } from "../ast/AstFunctions";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { Expression } from "../ast/Expression";
import { Reference } from "../ast/Reference";
import { isType, Type } from "../ast/Type";
import { TypeReference } from "../ast/TypeReference";
import { kypeToTypeExpression, toExpression } from "./kypeToTypeExpression";

export function combineTypes(operator: "&&" | "||", types: Type[]): Type {
    if (types.length === 1) {
        return types[0];
    }
    if (types.length === 0) {
        debugger;
        console.log("TYPES!!!!!!", types);
    }
    let type = new kype.TypeExpression(types[0].toKype());
    for (let i = 1; i < types.length; i++) {
        type = kype.combineTypes(type, operator, new kype.TypeExpression(types[i].toKype()));
    }
    return kypeToTypeExpression(type, types[0].location) as Type;
}

export function simplify(type: Type): Type
export function simplify(type: Expression): Expression
export function simplify(type: Type | Expression): Type | Expression {
    let newKypeType = type.toKype();
    if (isType(type)) {
        newKypeType = new kype.TypeExpression(newKypeType);
    }
    newKypeType = kype.simplify(newKypeType);
    let result = toExpression(newKypeType, type.location);
    return result;
}
