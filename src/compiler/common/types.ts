import { Reference } from "../ast/Reference";
import { SourceLocation } from "../ast/SourceLocation";
import { toTypeExpression } from "../ast/TypeExpression";

export enum CoreType {
    Integer = "Integer",
    Float = "Float",
    String = "String",
}

export function getTypeAssertion(absolutePathName: string, location = SourceLocation.empty) {
    return toTypeExpression(new Reference(location, absolutePathName));
}