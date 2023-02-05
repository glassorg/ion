import { EvaluationContext } from "../EvaluationContext";
import { AbstractTypeDeclaration } from "./AbstractTypeDeclaration";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { FieldDeclaration } from "./FieldDeclaration";
import { InferredType } from "./InferredType";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";

export class StructDeclaration extends AbstractTypeDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        public readonly fields: FieldDeclaration[]
    ){
        super(location, id);
    }

    get type(): TypeExpression {
        throw new Error();
    }

    get keyword() {
        return "struct";
    }

    toString() {
        return `${this.toMetaString()}${this.keyword} ${this.id}${this.toBlockString(this.fields)}`;
    }

}