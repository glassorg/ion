import { Expression } from "./Expression";
import * as kype from "@glas/kype";

export class DotExpression extends Expression {

    // dot expressions are always considered resolved.
    public readonly resolved = true;

    public toKype(): kype.Expression {
        return new kype.DotExpression();
    }

    toString() {
        return `.`;
    }

    toJSON() {
        let { resolved, ...rest } = super.toJSON();
        return { ...rest };
    }

}

