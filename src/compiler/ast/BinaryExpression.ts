import { InfixOperator } from "../Operators";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { DotExpression } from "./DotExpression";
import { SemanticError } from "../SemanticError";

export abstract class BinaryExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly left: Expression,
        public readonly operator: InfixOperator,
        public readonly right: Expression
    ){
        super(location);
        if (operator == null) {
            throw new Error(`operator missing`);
        }
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
            if ((this.right as any).name == null) {
                throw new SemanticError(`Expected right side of is to be a Reference`, this.right);
            }
            return new kype.BinaryExpression(
                new kype.MemberExpression(
                    this.left.toKype(),
                    new kype.Reference("class")
                ),
                "==",
                new kype.StringLiteral((this.right as any).name)
            );
        }
        return new kype.BinaryExpression(this.left.toKype(), this.operator, this.right.toKype());
    }

    toString() {
        return `(${this.left} ${this.operator} ${this.right})`;
    }

    public toUserTypeString(): string {
        if (this.left instanceof DotExpression && (this.operator === "is" || this.operator === "==")) {
            return this.right.toString();
        }
        if (this.operator === "&&") {
            return `(${this.left.toUserTypeString()} & ${this.right.toUserTypeString()})`;
        }
        if (this.operator === "||") {
            return `(${this.left.toUserTypeString()} | ${this.right.toUserTypeString()})`;
        }
        return super.toUserTypeString();
    }
    
}

