import { AbstractTypeDeclaration } from "./AbstractTypeDeclaration";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

export class TypeDeclaration extends AbstractTypeDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        public readonly type: Expression
    ) {
        super(location, id);
    }

}