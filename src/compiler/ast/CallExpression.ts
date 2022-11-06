import { InfixOperator } from "../Operators";
import { Position } from "../PositionFactory";
import { Expression } from "./Expression";
import { Reference } from "./Reference";

export class CallExpression extends Expression {

    constructor(
        position: Position,
        public readonly callee: Expression,
        public readonly args: Expression[],
    ){
        super(position);
    }

    *splitInternal(operator: InfixOperator): Generator<Expression> {
        if (this.callee instanceof Reference && this.callee.name === operator && this.args.length === 2) {
            // if this is a Call representation of a binary expression we still split it.
            yield* this.args[0].splitInternal(operator);
            yield* this.args[1].splitInternal(operator);
        }
    }

}