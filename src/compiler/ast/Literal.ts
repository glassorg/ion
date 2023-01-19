import { joinExpressions } from ".";
import { CoreType } from "../common/types";
import { EvaluationContext } from "../EvaluationContext";
import { AstNode } from "./AstNode";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { SemanticError } from "../SemanticError";

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

    resolve(this: Literal<T>, c: EvaluationContext): void | AstNode {
        return this.patch({
            resolvedType: joinExpressions("&&", [
                new ComparisonExpression(
                    this.location,
                    new DotExpression(this.location),
                    "is",
                    new Reference(this.location, this.coreType).patch({ resolved: true })
                ),
                new ComparisonExpression(
                    this.location,
                    new DotExpression(this.location),
                    "==",
                    this.patch({ resolved: true })
                ),
            ])
        });
    }

    toString() {
        return JSON.stringify(this.value);
    }

}