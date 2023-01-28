import { CoreTypes } from "../common/CoreType";
import { EvaluationContext } from "../EvaluationContext";
import { LogicalOperator } from "../Operators";
import { BinaryExpression } from "./BinaryExpression";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
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

    protected override resolveType(c: EvaluationContext): Expression {
        return new ComparisonExpression(this.location,
            new DotExpression(this.location),
            "is",
            new Reference(this.location, CoreTypes.Boolean)
        );
    }

}