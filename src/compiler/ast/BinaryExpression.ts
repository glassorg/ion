import { InfixOperator } from "../Operators";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { DotExpression } from "./DotExpression";
import { SemanticError } from "../SemanticError";
import { Literal } from "./Literal";
import { Reference } from "./Reference";

export function toKypeCheck(left: Expression, right: Reference) {
    return new kype.BinaryExpression(
        new kype.MemberExpression(
            left.toKype(),
            new kype.Reference("class")
        ),
        "==",
        new kype.StringLiteral(right.name)
    );    
}

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

    public toKype(): kype.Expression {
        let operator = this.operator;
        if (operator === "is") {
            if (this.right instanceof Literal) {
                //  if right is a literal then operator "is" will be same as "=="
                //  this can happen when ". is false" is resolved to ". is 0"
                operator = "==";
            }
            else {
                //  we only have a structural types, no inheritance, so type constraints are clear.
                //  for now only using Classes on is, if we use types.. then I guess that will have to be different.
                if (this.right instanceof Reference) {
                    return toKypeCheck(this.left, this.right);
                }
                throw new SemanticError(`Expected right side of is to be a Reference`, this.right);
            }
        }
        return new kype.BinaryExpression(this.left.toKype(), operator as kype.BinaryOperator, this.right.toKype());
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

