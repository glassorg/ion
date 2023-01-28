import { Expression } from "./Expression";
import * as kype from "@glas/kype";

export class DotExpression extends Expression {

    public toKype(): kype.Expression {
        return new kype.DotExpression();
    }

    public override get resolved(): boolean {
        return true;
    }

    toString() {
        return `.`;
    }

    toJSON() {
        let { resolved, ...rest } = super.toJSON();
        return { ...rest };
    }

}

