import { PrefixOperator } from "../Operators";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";

export class UnaryExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly operator: PrefixOperator,
        public readonly argument: Expression,
    ){
        super(location);
    }

    public toKype(): kype.Expression {
        if (this.operator === "typeof") {
            const argumentType = this.argument.type;
            if (!argumentType) {
                console.log(this);
                throw new Error(`Expected this to be resolved for typeof`);
            }
            return this.argument.type!.toKype();
        }
        return new kype.UnaryExpression(this.operator as kype.UnaryOperator, this.argument.toKype(), this);
    }

    toString() {
        return `${this.operator} ${this.argument}${this.toTypeString(this.type)}`;
    }

}