import { BlockStatement } from "./BlockStatement";
import { RootDeclaration } from "./Declaration";
import { SourceLocation } from "./SourceLocation";

export class Assembly extends BlockStatement {

    constructor(
        declarations: RootDeclaration[]
    ) {
        super(SourceLocation.empty, declarations);
    }

    public get declarations(): RootDeclaration[] {
        return this.statements as RootDeclaration[];
    }

}