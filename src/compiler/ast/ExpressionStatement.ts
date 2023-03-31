import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export class ExpressionStatement extends Statement {

    constructor(
        location: SourceLocation,
        public readonly expression: Expression,
    ){
        super(location);
    }

    toString(user?: boolean) {
        return `${this.expression.toString(user)};`
    }

}