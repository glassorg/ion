import { PrefixOperator } from "../Operators";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class UnaryExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly operator: PrefixOperator,
        public readonly argument: Expression,
    ){
        super(location);
    }

    toString() {
        return `${this.operator} ${this.argument}`;
    }

}