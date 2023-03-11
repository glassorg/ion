import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Token } from "./Token";
import { Type } from "./Type";

export class PstGroup extends Expression {

    constructor(
        location: SourceLocation,
        public readonly open: Token,
        public readonly close: Token,
        public readonly value?: Expression,
        public readonly type?: Type,
        public readonly exactType?: boolean,
    ){
        super(location);
    }

    toString(includeTypes?: boolean | undefined): string {
        return this.value?.toString(includeTypes) ?? `PSTGROUP`;
    }

}