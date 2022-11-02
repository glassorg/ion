import { Position } from "../PositionFactory";
import { BlockStatement } from "./BlockStatement";
import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";
import { ParameterDeclaration } from "./ParameterDeclaration";

export class FunctionDeclaration extends Declaration {

    constructor(
        position: Position,
        id: Declarator,
        public readonly parameters: ParameterDeclaration[],
        public readonly body: BlockStatement,
    ){
        super(position, id);
    }

    get writable() {
        return true;
    }

}