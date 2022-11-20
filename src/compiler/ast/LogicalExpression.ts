import { LogicalOperator } from "../Operators";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class LogicalExpression extends BinaryExpression {

    constructor(
        location: SourceLocation,
        left: Expression,
        operator: LogicalOperator,
        right: Expression
    ){
        super(location, left, operator, right);
    }

}