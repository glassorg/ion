import { Position } from "../PositionFactory";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";

export class AssignmentExpression extends BinaryExpression {

    constructor(
        position: Position,
        left: Expression,
        right: Expression,
    ){
        super(position, left, "=", right);
    }

}