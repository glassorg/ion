import { InfixOperator } from "../Operators";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export abstract class BinaryExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly left: Expression,
        public readonly operator: InfixOperator,
        public readonly right: Expression
    ){
        super(location);
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

    toString() {
        return `(${this.left} ${this.operator} ${this.right})`;
    }
    
}

