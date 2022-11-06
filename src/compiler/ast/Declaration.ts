import { Position } from "../PositionFactory";
import { Declarator } from "./Declarator";
import { Statement } from "./Statement";

export abstract class Declaration extends Statement {

    constructor(
        position: Position,
        public readonly id: Declarator
    ){
        super(position);
    }

}