import * as kype from "@glas/kype";
import { ComparisonExpression } from "../ast/ComparisonExpression";
import { Expression } from "../ast/Expression";
import { Reference } from "../ast/Reference";
import { Type } from "../ast/Type";
import { TypeExpression } from "../ast/TypeExpression";
import { TypeReference } from "../ast/TypeReference";
import { kypeToTypeExpression, toExpression } from "./kypeToTypeExpression";

export function combineTypes(operator: "&&" | "||", types: Type[]): Type {
    if (types.length === 1) {
        return types[0];
    }
    let type = types[0].toKype();
    for (let i = 1; i < types.length; i++) {
        type = kype.combineTypes(type, operator, types[i].toKype());
    }
    return kypeToTypeExpression(type, types[0].location) as Type;
}

export function simplify(type: Type): Type
export function simplify(type: Expression): Expression
export function simplify(type: Type | Expression): Type | Expression {
    const wasTypeReference = type instanceof TypeReference
    let newKypeType = kype.simplify(type.toKype());
    let result = toExpression(newKypeType, type.location);
    if (wasTypeReference) {
        //  convert back to type reference
        //  and simplify the generic parameters as well.
        const ref = ((result as TypeExpression).proposition as ComparisonExpression).right as Reference;
        result = new TypeReference(
            type.location,
            ref.name,
            type.generics.map(g => simplify(g))
        );
    }
    return result;
}
