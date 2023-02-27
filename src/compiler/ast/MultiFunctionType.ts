import { Expression } from "./Expression";
import { FunctionType } from "./FunctionType";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";

export class MultiFunctionType extends Type {

    constructor(
        location: SourceLocation,
        public readonly functionTypes: FunctionType[],
    ) {
        super(location);
    }

    public toKype() {
        return new kype.TypeExpression(new kype.CustomExpression(this));
    }

    toString() {
        return `multifunctype ${this.toBlockString(this.functionTypes, "[", "]")}`;
    }
}
