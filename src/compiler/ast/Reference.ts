import { isValidId } from "../common/names";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { isCoreType } from "../common/CoreType";
import { Writable } from "../common/TypescriptTypes";
import { Identifier } from "./Identifier";

export class Reference extends Expression {

    constructor(
        location: SourceLocation,
        public readonly name: string,
    ){
        super(location);
        if (this.name == null) {
            throw new Error(`Missing name`);
        }
        if (isCoreType(this.name)) {
            (this as Writable<typeof this>).resolved = true;
        }
    }

    public toKype(): kype.Expression {
        return new kype.Reference(this.name);
    }

    toDeclarator() {
        return new Declarator(this.location, this.name);
    }

    toString(user?: boolean) {
        return Identifier.prototype.toString.call(this, user);
        // return (isValidId(this.name) ? this.name : ("`" + this.name + "`")) + (includeTypes ? this.toTypeString(this.type, "::") : "");
    }

}