import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Token } from "./Token";

export class PstGroup extends Expression {

    constructor(
        location: SourceLocation,
        public readonly open: Token,
        public readonly close: Token,
        public readonly value?: Expression,
    ){
        super(location);
    }

}