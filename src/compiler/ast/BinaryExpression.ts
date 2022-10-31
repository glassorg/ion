import { InfixOperator, InfixOperators } from "../Operators";
import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class BinaryExpression extends Expression {

    constructor(
        position: Position,
        public readonly left: Expression,
        public readonly operator: InfixOperator,
        public readonly right: Expression
    ){
        super(position);
    }

}