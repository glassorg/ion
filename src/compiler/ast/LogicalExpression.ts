import { LogicalOperator } from "../Operators";
import { Position } from "../PositionFactory";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";

export class LogicalExpression extends BinaryExpression {

    constructor(
        position: Position,
        left: Expression,
        operator: LogicalOperator,
        right: Expression
    ){
        super(position, left, operator, right);
    }

}