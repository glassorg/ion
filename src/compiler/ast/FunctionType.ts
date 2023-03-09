import { isSubTypeOf } from "../analysis/isSubType";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";
import { Expression } from "./Expression";

export class FunctionType extends Expression implements Type {

    constructor(
        location: SourceLocation,
        public readonly parameterTypes: Type[],
        public readonly returnType: Type
    ) {
        super(location);
    }

    get isType(): true { return true }

    toString() {
        return `(${this.parameterTypes.map(p => p.toUserTypeString()).join(",")}) => ${this.returnType?.toUserTypeString()}`;
    }

    toKype(): kype.TypeExpression {
        return new kype.TypeExpression(new kype.CustomExpression(this));
    }
}
