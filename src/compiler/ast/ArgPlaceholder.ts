import { Expression } from "./Expression";
import * as kype from "@glas/kype";
import { SourceLocation } from "./SourceLocation";
import { Writable } from "../common/TypescriptTypes";

export class ArgPlaceholder extends Expression {

    constructor(
        location: SourceLocation,
        public readonly index: number,
    ) {
        super(location);
        (this as Writable<ArgPlaceholder>).resolved = true;
    }

    public toKype(): kype.Expression {
        return new kype.CustomExpression(this);
    }

    toString() {
        return `@arg(${this.index})`;
    }

}

