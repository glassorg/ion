import { Position } from "../PositionFactory";
import { AbstractTypeDeclaration } from "./AbstractTypeDeclaration";
import { Declarator } from "./Declarator";
import { FieldDeclaration } from "./FieldDeclaration";
import { TypeExpression } from "./TypeExpression";

export class StructDeclaration extends AbstractTypeDeclaration {

    constructor(
        position: Position,
        id: Declarator,
        public readonly fields: FieldDeclaration[]
    ){
        super(position, id);
    }

    get type(): TypeExpression {
        throw new Error();
    }

}