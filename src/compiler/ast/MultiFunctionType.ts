import { Expression } from "./Expression";
import { FunctionType } from "./FunctionType";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";
import { type Identifier } from "./Identifier";
import { type EvaluationContext } from "../EvaluationContext";
import { TypeReference } from "./TypeReference";
import { CoreTypes } from "../common/CoreType";

export class MultiFunctionType extends Expression implements Type {

    constructor(
        location: SourceLocation,
        public readonly functionTypes: FunctionType[],
    ) {
        super(location);
    }

    get isType(): true { return true }

    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type | null {
        return null;
    }

    getClass(c: EvaluationContext): Type {
        return new TypeReference(this.location, CoreTypes.Function);
    }

    public toKype() {
        return new kype.TypeExpression(new kype.CustomExpression(this));
    }

    toString(user?: boolean) {
        return `multifunctype ${this.toBlockString(user, this.functionTypes, "[", "]")}`;
    }
}
