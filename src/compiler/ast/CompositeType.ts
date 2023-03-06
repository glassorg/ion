import { BinaryExpression } from "./BinaryExpression";
import { SourceLocation } from "./SourceLocation";
import { Type } from "./Type";
import * as kype from "@glas/kype";

export class CompositeType extends BinaryExpression implements Type {

    declare left: Type;
    declare operator: "&" | "|";
    declare right: Type;

    constructor(
        location: SourceLocation,
        left: Type,
        operator: "&" | "|",
        right: Type
    ){
        super(location, left, operator, right);
    }

    get isType(): true { return true }

    toString() {
        return `{${this.left} ${this.operator} ${this.right}}`;
    }

    toKype(): kype.Expression {
        let operator = this.operator === "&" ? "&&" : "||";
        return new kype.BinaryExpression(this.left.toKype(), operator as kype.BinaryOperator, this.right.toKype());
    }

}