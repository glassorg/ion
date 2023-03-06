import { ComparisonOperator } from "../Operators";
import { SemanticError } from "../SemanticError";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class ComparisonExpression extends BinaryExpression {

    declare readonly operator: ComparisonOperator;

    constructor(
        location: SourceLocation,
        left: Expression,
        operator: ComparisonOperator,
        right: Expression
    ){
        super(location, left, operator, right);
        if (operator === "is") {
            if (right.constructor.name === "Reference") {
                console.log("IS ERROR", right.constructor.name);
                throw new SemanticError(`Should be a TypeReference`, right)
            }
        }
    }

}