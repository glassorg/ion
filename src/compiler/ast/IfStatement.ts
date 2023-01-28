import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export class IfStatement extends Statement {

    constructor(
        location: SourceLocation,
        public readonly test: Expression,
        public readonly consequent: BlockStatement,
        public readonly alternate?: BlockStatement,
    ){
        super(location);
    }

    toString() {
        let result = `if ${this.test} ${this.consequent}`;
        if (this.alternate) {
            result += `\nelse ${this.alternate}`
        }
        return result;
    }

}