import { Expression } from "./Expression";
import * as kype from "@glas/kype";
import { SourceLocation } from "./SourceLocation";
import { Writable } from "../common/TypescriptTypes";

export const DotExpressionString = '.';

export class DotExpression extends Expression {

    constructor(location: SourceLocation) {
        super(location);
        (this as Writable<typeof this>).resolved = true;
    }

    public toKype(): kype.Expression {
        return new kype.DotExpression(this);
    }

    toString() {
        return DotExpressionString;
    }

    toJSON() {
        let { resolved, ...rest } = super.toJSON();
        return { ...rest };
    }

}

