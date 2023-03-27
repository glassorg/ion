import { Expression } from "./Expression";
import * as kype from "@glas/kype";
import { SourceLocation } from "./SourceLocation";

export const DotExpressionString = '@';

export class DotExpression extends Expression {

    constructor(location: SourceLocation) {
        super(location);
    }

    public toKype(): kype.Expression {
        return new kype.DotExpression(this);
    }

    toString() {
        return DotExpressionString;
    }

}

