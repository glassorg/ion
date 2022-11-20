import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export class IfStatement extends Expression {

    constructor(
        location: SourceLocation,
        public readonly test: Expression,
        public readonly consequent: Statement,
        public readonly alternate?: Statement,
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