import { isValidId } from "../common/names";
import { getSSAOriginalName } from "../common/ssa";
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

    toString(user?: boolean) {
        const name = user ? getSSAOriginalName(this.name) : this.name;
        return isValidId(name) ? name : "`" + name + "`";
    }

}