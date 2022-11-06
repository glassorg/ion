import { Position } from "../PositionFactory";
import { AbstractTypeDeclaration } from "./AbstractTypeDeclaration";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";

export class TypeDeclaration extends AbstractTypeDeclaration {

    constructor(
        position: Position,
        id: Declarator,
        public readonly type: Expression
    ) {
        super(position, id);
    }

}