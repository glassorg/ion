import { AstNode } from "./AstNode";
import { RootDeclaration } from "./Declaration";
import { SourceLocation } from "./SourceLocation";

export class Assembly extends AstNode {

    constructor(
        public readonly declarations: RootDeclaration[]
    ) {
        super(SourceLocation.empty);
    }

    toString(user?: boolean) {
        return this.toBlockString(user, this.declarations);
    }

}