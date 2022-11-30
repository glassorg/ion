import { Immutable } from "./Immutable";
import { InfixOperator } from "../Operators";
import type { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class AstNode extends Immutable {

    constructor(
        public readonly location: SourceLocation
    ) {
        super();
    }

    split(operator: InfixOperator): Expression[] {
        let expressions: Expression[] = [];
        for (let expression of this.splitInternal(operator)) {
            expressions.push(expression);
        }
        return expressions;
    }

    *splitInternal(operator: InfixOperator): Generator<Expression> {
        yield this;
    }

    toJSON() {
        let { location, ...rest } = super.toJSON();
        return { ...rest };
    }

    toString() {
        return super.toString();
    }

    toBlockString(nodes: AstNode[], open = "{", close = "}", indent = '    ') {
        if (nodes == null || nodes.length === 0) {
            return `${open}${close}`;
        }
        return (`${open}\n${nodes.join(`\n`).split(`\n`).map(a => indent + a).join(`\n`)}\n${close}`);
    }

}