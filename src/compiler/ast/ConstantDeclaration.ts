import { Position } from "../PositionFactory";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { VariableDeclaration } from "./VariableDeclaration";

export class ConstantDeclaration extends VariableDeclaration {

    declare public readonly value: Expression

    constructor(
        position: Position,
        id: Declarator,
        value: Expression,
    ){
        super(position, id, null, value);
    }

    get writable() {
        return false;
    }

}