import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { SourceLocation } from "./SourceLocation";

export class ConstantDeclaration extends AbstractValueDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        public readonly value: Expression,
    ) {
        super(location, id, null);
    }

    toString() {
        return `let ${this.id} = ${this.value}`;
    }

}