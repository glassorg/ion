import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export class ReturnStatement extends Statement {

    constructor(
        location: SourceLocation,
        public readonly argument: Expression,
    ){
        super(location);
    }

    toString() {
        return `return ${this.argument}`;
    }

}