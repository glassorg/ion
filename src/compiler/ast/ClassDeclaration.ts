import { Position } from "../PositionFactory";
import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";

export class ClassDeclaration extends Declaration {

    constructor(
        position: Position,
        id: Declarator,
        public readonly declarations: Declaration[]
    ){
        super(position, id);
    }

}