import { Expression } from "./Expression";

export class DotExpression extends Expression {

    // dot expressions are always considered resolved.
    public readonly resolved = true;

    toString() {
        return `.`;
    }

    toJSON() {
        let { resolved, ...rest } = super.toJSON();
        return { ...rest };
    }

}

