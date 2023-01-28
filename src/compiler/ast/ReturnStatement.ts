import { EvaluationContext } from "../EvaluationContext";
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

    protected *dependencies(c: EvaluationContext) {
        yield this.argument;
    }

    toString() {
        return `return ${this.argument}`;
    }

}