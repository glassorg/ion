import { Expression } from "./Expression";
import * as kype from "@glas/kype";
import { SourceLocation } from "./SourceLocation";
import { skip, traverse } from "../common/traverse";
import { TypeExpression } from "./TypeExpression";

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

    toJSON() {
        let { resolved, ...rest } = super.toJSON();
        return { ...rest };
    }

}

