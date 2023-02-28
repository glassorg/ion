import { Expression } from "./Expression";
import * as kype from "@glas/kype";
import { Reference } from "./Reference";
import { TypeReference } from "./TypeReference";
import { toTypeExpression } from "./TypeExpression";

export function isType(node: unknown): node is Type {
    const maybe = node as Partial<Type>;
    return maybe.isType === true;
}

export interface Type extends Expression {
    isType: true;
    toKype(): kype.TypeExpression;
}

export function toType(e: Expression): Type {
    if (e instanceof Reference) {
        return new TypeReference(e.location, e.name);
    }
    return toTypeExpression(e);
}
