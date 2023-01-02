import { Identifier } from "./Identifier";
import { SourceLocation } from "./SourceLocation";

export class Declarator extends Identifier {

    constructor(
        location: SourceLocation,
        name: string
    ) {
        super(location, name);
    }

    public get isDeclarator() {
        return true;
    }

}