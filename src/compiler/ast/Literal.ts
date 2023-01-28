import { joinExpressions } from ".";
import { CoreType } from "../common/CoreType";
import { EvaluationContext } from "../EvaluationContext";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { SemanticError } from "../SemanticError";
import { TypeExpression } from "./TypeExpression";
import { InferredType } from "./InferredType";

export abstract class Literal<T> extends Expression {

    constructor(
        location: SourceLocation,
        public readonly value: T,
    ){
        super(location);
    }

    abstract get coreType(): CoreType

    public toKype(): kype.Expression {
        if (typeof this.value === "number") {
            return new kype.NumberLiteral(this.value);
        }
        if (typeof this.value === "string") {
            return new kype.StringLiteral(this.value);
        }
        throw new SemanticError(`Expected number literal`, this);
    }

    override resolveType(this: Literal<T>, c: EvaluationContext): TypeExpression {
        return joinExpressions("&&", [
            new ComparisonExpression(
                this.location,
                new DotExpression(this.location),
                "is",
                new Reference(this.location, this.coreType)
            ),
            new ComparisonExpression(
                this.location,
                new DotExpression(this.location),
                "==",
                // must have type specified to avoid infinite recursion
                this.patch({ resolvedType: new InferredType(this.location) })
            ),
        ]);
    }

    toString() {
        return JSON.stringify(this.value);
    }

}