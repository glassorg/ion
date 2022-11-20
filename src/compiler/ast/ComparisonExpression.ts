import { ComparisonOperator } from "../Operators";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class ComparisonExpression extends BinaryExpression {

    constructor(
        location: SourceLocation,
        left: Expression,
        operator: ComparisonOperator,
        right: Expression
    ){
        super(location, left, operator, right);
    }

}