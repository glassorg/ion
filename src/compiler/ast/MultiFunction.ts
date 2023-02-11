import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";

export class MultiFunction extends Expression {

    constructor(
        public readonly functions: Reference[],
    ) {
        super(SourceLocation.empty);
    }

    toString() {
        return `multifunction ${this.toBlockString(this.functions)}`;
    }

}