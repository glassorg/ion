import { SequenceOperator } from "../Operators";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class SequenceExpression extends BinaryExpression {

    constructor(
        location: SourceLocation,
        left: Expression,
        operator: SequenceOperator,
        right: Expression
    ){
        super(location, left, operator, right);
    }

}