import { Expression } from "./Expression";
import * as kype from "@glas/kype";
import { SourceLocation } from "./SourceLocation";

export class ArgPlaceholder extends Expression {

    constructor(
        location: SourceLocation,
        public readonly index: number,
    ) {
        super(location);
    }

    public toKype(): kype.Expression {
        return new kype.Reference(this.toString(), this);
    }

    toString() {
        return `@arg_${this.index}`;
    }

}

