import { AstNode } from "./AstNode";
import { SourceLocation } from "./SourceLocation";

export class Token extends AstNode {

    constructor(
        location: SourceLocation,
        public readonly type: string,
        // public readonly source: string,
        public readonly value: string,
    ) {
        super(location);
    }

    static merge(left: Token, right: Token) {
        return left.patch({
            value: left.value + right.value,
            location: SourceLocation.merge(left.location, right.location)
        });
    }

}