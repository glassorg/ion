import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class IndexExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly object: Expression,
        public readonly index: Expression,
    ){
        super(location);
    }

}