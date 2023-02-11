import { EvaluationContext } from "../EvaluationContext";
import { Expression } from "./Expression";
import { IfStatement } from "./IfStatement";
import { LogicalExpression } from "./LogicalExpression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";

export class ConditionalAssertion extends Expression {

    constructor(
        location: SourceLocation,
        public readonly value: Reference,
        public readonly negate: boolean,
        public readonly isChained = false
    ) {
        super(location);
    }

    getKnownTrueExpression(c: EvaluationContext): Expression {
        if (this.isChained) {
            let parentExpression = c.lookup.findAncestor(this, LogicalExpression)!;
            let { left, right } = parentExpression;
            return left;
        }
        let cond = c.lookup.findAncestor(this, IfStatement)!;
        return cond.test;
    }

    toString() {
        if (this.type) {
            return `cond ${this.type}`;
        }
        else {
            return `cond ${this.negate ? `!` : ``}${this.value}`;
        }
    }

}
