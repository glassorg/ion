import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class Literal<T> extends Expression {

    constructor(
        location: SourceLocation,
        public readonly value: T,
    ){
        super(location);
    }

    toString() {
        return JSON.stringify(this.value);
    }

}