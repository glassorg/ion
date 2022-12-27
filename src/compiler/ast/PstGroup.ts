import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Token } from "./Token";
import { TypeExpression } from "./TypeExpression";

export class PstGroup extends Expression {

    constructor(
        location: SourceLocation,
        public readonly open: Token,
        public readonly close: Token,
        public readonly value?: Expression,
        public readonly declaredType?: TypeExpression,
    ){
        super(location);
    }

}