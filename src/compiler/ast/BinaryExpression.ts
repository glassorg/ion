import { InfixOperator } from "../Operators";
import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export abstract class BinaryExpression extends Expression {

    constructor(
        position: Position,
        public readonly left: Expression,
        public readonly operator: InfixOperator,
        public readonly right: Expression
    ){
        super(position);
    }

    *splitInternal(operator: InfixOperator): Generator<Expression> {
        if (this.operator === operator) {
            yield* this.left.splitInternal(operator);
            yield* this.right.splitInternal(operator);
        }
        else {
            yield this;
        }
    }
    
}

