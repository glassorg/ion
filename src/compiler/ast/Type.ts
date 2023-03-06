import { Expression } from "./Expression";
import { toTypeExpression } from "./TypeExpression";

export function isType(node: unknown): node is Type {
    const maybe = node as Partial<Type>;
    return maybe.isType === true;
}

export interface Type extends Expression {
    isType: true;
}

export function toType(e: Expression): Type {
    return toTypeExpression(e);
}
