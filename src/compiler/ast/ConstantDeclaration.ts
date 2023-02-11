import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export abstract class ConstantDeclaration extends Declaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        public readonly value: Expression
    ) {
        super(location, id);
    }

    toString(includeTypes = true) {
        return `${this.toMetaString()}let ${this.id}${this.toTypeString()} = ${this.value.toString(includeTypes)}`;
    }

}