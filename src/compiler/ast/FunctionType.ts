import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";
import { Expression } from "./Expression";
import { type EvaluationContext } from "../EvaluationContext";
import { type Identifier } from "./Identifier";
import { TypeReference } from "./TypeReference";
import { CoreTypes } from "../common/CoreType";

export class FunctionType extends Expression implements Type {

    constructor(
        location: SourceLocation,
        public readonly parameterTypes: Type[],
        public readonly returnType: Type
    ) {
        super(location);
    }

    get isType(): true { return true }

    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type | null {
        return null;
    }

    getClass() {
        return new TypeReference(this.location, CoreTypes.Function);
    }

    toString(user?: boolean) {
        return `(${this.parameterTypes.map(p => p.toString(user)).join(",")}) => ${this.returnType?.toString(user)}`;
    }

    toKype(): kype.TypeExpression {
        return new kype.TypeExpression(new kype.CustomExpression(this));
    }
}
