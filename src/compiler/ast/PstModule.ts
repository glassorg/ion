import { AstNode } from "./AstNode";
import { Declaration } from "./Declaration";
import { SourceLocation } from "./SourceLocation";

export class PstModule extends AstNode {

    constructor(
        location: SourceLocation,
        public readonly name: string,
        public readonly declarations: Declaration[],
    ){
        super(location);
    }

}