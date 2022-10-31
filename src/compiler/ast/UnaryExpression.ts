import { PrefixOperator } from "../Operators";
import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class UnaryExpression extends Expression {

    constructor(
        position: Position,
        public readonly operator: PrefixOperator,
        public readonly argument: Expression,
    ){
        super(position);
    }

}