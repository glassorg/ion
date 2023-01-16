import { InfixOperator } from "../Operators";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { DotExpression } from "./DotExpression";

export abstract class BinaryExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly left: Expression,
        public readonly operator: InfixOperator,
        public readonly right: Expression
    ){
        super(location);
    }

    *splitInternal(operator: InfixOperator): Generator<Expression> {
        if (this.operator === operator) {
            yield* this.left.splitInternal(operator);
            yield* this.right.splitInternal(operator);
        }
        else {
            yield this;
        }
    }

    public toKype(): kype.Expression {
        if (this.operator === "is") {
            //  we only have a structural types, no inheritance, so type constraints are clear.
            //  for now only using Classes on is, if we use types.. then I guess that will have to be different.
            return new kype.BinaryExpression(
                new kype.MemberExpression(
                    this.left.toKype(),
                    new kype.Reference("class")
                ),
                "==",
                new kype.StringLiteral(this.right.toString())
            );
        }
        return new kype.BinaryExpression(this.left.toKype(), this.operator, this.right.toKype());
    }

    toString() {
        return `(${this.left} ${this.operator} ${this.right})`;
    }

    public toUserTypeString(): string {
        if (this.left instanceof DotExpression && this.operator === "is") {
            return this.right.toString();
        }

        if (this.operator === "&&") {
            return `${this.left.toUserTypeString()} & ${this.right.toUserTypeString()}`;
        }
        if (this.operator === "||") {
            return `${this.left.toUserTypeString()} | ${this.right.toUserTypeString()}`;
        }
        return super.toUserTypeString();
    }
    
}

