import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";
import { TypeReference } from "./TypeReference";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { joinExpressions } from "./AstFunctions";
import { CoreTypes } from "../common/CoreType";

export function isArrayType(type?: Type) {
    return getArrayElementType(type) !== undefined;
}

export function getArrayElementType(type?: Type): Type | null | undefined {
    if (type instanceof TypeReference) {
        if (type.name === CoreTypes.Array) {
            return type.generics[0] ?? null;
        }
    }
    else if (type instanceof TypeExpression) {
        return getArrayElementType(type.baseType);
    }
}

export class TypeExpression extends Expression implements Type {

    public readonly baseType: TypeReference;

    constructor(
        location: SourceLocation,
        baseType: TypeReference | string,
        public readonly constraints: Expression[] = [],
    ) {
        super(location);
        this.baseType = baseType instanceof TypeReference ? baseType : new TypeReference(location, baseType);
    }

    get isType(): true { return true }

    public toKype() {
        const constraints = [...this.constraints];
        if (this.baseType.name !== CoreTypes.Any) {
            constraints.push(
                new ComparisonExpression(this.baseType.location, new DotExpression(this.baseType.location), "is", this.baseType)
            )
        }
        return new kype.TypeExpression(joinExpressions("&&", constraints).toKype());
    }

    toString() {
        return `${this.baseType}{${this.constraints}}`;
    }

    public toUserTypeString(): string {
        if (this.constraints.length === 0) {
            return this.baseType.toUserTypeString();
        }
        return `${this.baseType.toUserTypeString()}{${this.constraints.map(c => c.toUserTypeString()).join(",")}}`;
    }

}
