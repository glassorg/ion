import { Position } from "../PositionFactory";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { AbstractValueDeclaration } from "./AbstractValueDeclaration";

export class ConstantDeclaration extends AbstractValueDeclaration {

    constructor(
        position: Position,
        id: Declarator,
        public readonly value: Expression,
    ) {
        super(position, id, null);
    }

}