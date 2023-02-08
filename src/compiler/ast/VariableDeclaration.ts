import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { TypeExpression } from "./TypeExpression";
import { SourceLocation } from "./SourceLocation";

export class VariableDeclaration extends AbstractValueDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        declaredType?: TypeExpression,
        public readonly defaultValue?: Expression,
        public readonly conditional?: true,
        public readonly phi?: true
    ){
        super(location, id, declaredType);
    }

    get keyword() {
        return `var`;
    }

    toString() {
        return `${this.toMetaString()}${this.keyword} ${this.id}${this.toTypeString()}${this.defaultValue ? ` = ${this.defaultValue}`: ``}`;
    }

}