import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { TypeExpression } from "./TypeExpression";
import { SourceLocation } from "./SourceLocation";

export class VariableDeclaration extends AbstractValueDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        valueType: TypeExpression | null,
        public readonly defaultValue: Expression | null,
    ){
        super(location, id, valueType);
    }

    get keyword() {
        return `var`;
    }

    toString() {
        if (this.valueType) {
            if (this.defaultValue) {
                return `${this.toMetaString()}${this.keyword} ${this.id}: ${this.valueType} = ${this.defaultValue}`;
            }
            return `${this.toMetaString()}${this.keyword} ${this.id}: ${this.valueType}`;
        }
        else if (this.defaultValue) {
            return `${this.toMetaString()}${this.keyword} ${this.id} := ${this.defaultValue}`;
        }
        return `${this.toMetaString()}${this.keyword} ${this.id}`;
    }

}