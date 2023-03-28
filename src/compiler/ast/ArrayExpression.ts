import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class ArrayExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly elements: Expression[]
    ){
        super(location);
    }

    toString() {
        return `[${this.elements.join(",")}]`;
    }
    
}

