import { CoreTypes } from "../common/CoreType";
import { EvaluationContext } from "../EvaluationContext";
import { ComparisonOperator } from "../Operators";
import { BinaryExpression } from "./BinaryExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { InferredType } from "./InferredType";
import { Reference } from "./Reference";
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
    }

    protected override resolveType(c: EvaluationContext): Expression {
        return new ComparisonExpression(this.location,
            new DotExpression(this.location),
            "is",
            new Reference(this.location, CoreTypes.Boolean)
        ).patch({ resolvedType: new InferredType(this.location) });
    }

}