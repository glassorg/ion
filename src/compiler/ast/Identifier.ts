import { AstNode } from "./AstNode";
import { SourceLocation } from "./SourceLocation";

export class Identifier extends AstNode {

    constructor(
        location: SourceLocation,
        public readonly name: string,
    ){
        super(location);
    }

    get isIdentifier() {
        return true;
    }

    toString() {
        return this.name;
    }

}