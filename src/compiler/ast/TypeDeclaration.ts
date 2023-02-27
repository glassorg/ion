import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";
import { SourceLocation } from "./SourceLocation";
import { TypeInterface } from "./TypeExpression";

export class TypeDeclaration extends Declaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        public readonly type: TypeInterface
    ) {
        super(location, id);
    }

    toString() {
        return `${this.toMetaString()}type ${this.id} = ${this.type}`;
    }

}