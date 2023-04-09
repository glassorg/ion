import { AssignmentOperator } from "../Operators";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class AssignmentExpression extends BinaryExpression {

    constructor(
        location: SourceLocation,
        left: Expression,
        right: Expression,
        operator: AssignmentOperator = "=",
    ) {
        super(location, left, operator, right);
    }

}