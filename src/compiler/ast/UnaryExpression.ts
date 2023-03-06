import { PrefixOperator } from "../Operators";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { SemanticError } from "../SemanticError";

export class UnaryExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly operator: PrefixOperator,
        public readonly argument: Expression,
    ){
        super(location);
        if (operator === "typeof" && this.constructor === UnaryExpression) {
            throw new SemanticError(`Should be a TypeofExpression`, location);
        }
    }

    public toKype(): kype.Expression {
        return new kype.UnaryExpression(this.operator as kype.UnaryOperator, this.argument.toKype(), this);
    }

    toString() {
        return `${this.operator} ${this.argument}${this.toTypeString(this.type)}`;
    }

}