import { EvaluationContext } from "../EvaluationContext";
import { InfixOperator } from "../Operators";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";

export class CallExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly callee: Expression,
        public readonly args: Expression[],
    ){
        super(location);
    }

    protected *dependencies(c: EvaluationContext) {
        yield this.callee;
        yield* this.args;
    }

    *splitInternal(operator: InfixOperator): Generator<Expression> {
        if (this.callee instanceof Reference && this.callee.name === operator && this.args.length === 2) {
            // if this is a Call representation of a binary expression we still split it.
            yield* this.args[0].splitInternal(operator);
            yield* this.args[1].splitInternal(operator);
        }
        else {
            yield this;
        }
    }

    toString() {
        return `${this.callee}(${this.args.join(", ")})`;
    }

}