import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { TypeExpression } from "./TypeExpression";
import { SourceLocation } from "./SourceLocation";
import { InferredType } from "./InferredType";

export class VariableDeclaration extends AbstractValueDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        declaredType: TypeExpression = new InferredType(location),
        public readonly defaultValue?: Expression,
    ){
        super(location, id, declaredType);
    }

    get keyword() {
        return `var`;
    }

    toString() {
        if (this.declaredType) {
            if (this.defaultValue) {
                return `${this.toMetaString()}${this.keyword} ${this.id}: ${this.declaredType} = ${this.defaultValue}`;
            }
            return `${this.toMetaString()}${this.keyword} ${this.id}: ${this.declaredType}`;
        }
        else if (this.defaultValue) {
            return `${this.toMetaString()}${this.keyword} ${this.id} := ${this.defaultValue}`;
        }
        return `${this.toMetaString()}${this.keyword} ${this.id}`;
    }

}