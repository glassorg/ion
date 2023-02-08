import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";

export class ConstantDeclaration extends AbstractValueDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        public readonly value: Expression,
        declaredType?: TypeExpression,
    ) {
        super(location, id, declaredType);
    }

    toString(includeTypes = true) {
        return `${this.toMetaString()}let ${this.id}${this.toTypeString()} = ${this.value.toString(includeTypes)}`;
    }

}