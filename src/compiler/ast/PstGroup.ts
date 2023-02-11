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
        public readonly type?: TypeExpression,
    ){
        super(location);
    }

    toString(includeTypes?: boolean | undefined): string {
        return this.value?.toString(includeTypes) ?? `PSTGROUP`;
    }

}