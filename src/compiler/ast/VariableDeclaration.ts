import { Position } from "../PositionFactory";
import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";

export class VariableDeclaration extends Declaration {

    constructor(
        position: Position,
        id: Declarator,
        public readonly value?: Expression,
    ){
        super(position, id);
    }

    get writable() {
        return true;
    }

}