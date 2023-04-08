import { isValidId } from "../common/names";
import { getSSAOriginalName } from "../common/ssa";
import { AstNode } from "./AstNode";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";

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

    toKype() {
        return new kype.Reference(this.name)
    }

    toString(user?: boolean) {
        const name = user ? getSSAOriginalName(this.name) : this.name;
        return isValidId(name) ? name : "`" + name + "`";
    }

}