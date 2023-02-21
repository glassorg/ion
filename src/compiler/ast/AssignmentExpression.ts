import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class AssignmentExpression extends BinaryExpression {

    constructor(
        location: SourceLocation,
        left: Expression,
        right: Expression,
    ){
        super(location, left, "=", right);
    }

}