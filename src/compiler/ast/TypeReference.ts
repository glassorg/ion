import { Reference } from "./Reference";
import { Type } from "./Type";
import { toKypeCheck } from "./BinaryExpression";
import { DotExpression } from "./DotExpression";
import * as kype from "@glas/kype";
import { SourceLocation } from "./SourceLocation";

export class TypeReference extends Reference implements Type {

    constructor(
        location: SourceLocation,
        public readonly name: string,
        public readonly generics: Type[] = [],
    ){
        super(location, name);
    }

    get isType(): true { return true; }

    public toKype(): kype.TypeExpression {
        console.log(`TypeReference.toKype: ${this}`);
        return new kype.TypeExpression(toKypeCheck(new DotExpression(this.location), this));
    }

    toString() {
        return super.toString() + (this.generics.length > 0 ? `<${this.generics.join(",")}>` : ``);
    }    

}
