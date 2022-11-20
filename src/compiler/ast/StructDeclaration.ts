import { AbstractTypeDeclaration } from "./AbstractTypeDeclaration";
import { Declarator } from "./Declarator";
import { FieldDeclaration } from "./FieldDeclaration";
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

}