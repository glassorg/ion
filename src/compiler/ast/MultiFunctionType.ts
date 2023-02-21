import { Expression } from "./Expression";
import { FunctionType } from "./FunctionType";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";

export class MultiFunctionType extends Expression {

    constructor(
        location: SourceLocation,
        public readonly functionTypes: FunctionType[],
    ) {
        super(location);
    }

    public toKype() {
        return new kype.CustomExpression(this);
    }

    toString() {
        return `multifunctype ${this.toBlockString(this.functionTypes, "[", "]")}`;
    }
}
