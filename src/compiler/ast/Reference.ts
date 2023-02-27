import { isValidId } from "../common/names";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { isCoreType } from "../common/CoreType";
import { Writable } from "../common/TypescriptTypes";
import { TypeInterface } from "./TypeExpression";

export class Reference extends Expression {

    constructor(
        location: SourceLocation,
        public readonly name: string,
        public readonly generics: TypeInterface[] = [],
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

    toGenericsString() {
        return this.generics.length > 0 ? `<${this.generics.join(",")}>` : ``;
    }

    toString(includeTypes = false) {
        return (isValidId(this.name) ? this.name : ("`" + this.name + "`")) + this.toGenericsString() + (includeTypes ? this.toTypeString(this.type, "::") : "");
    }

}