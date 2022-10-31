import { Position } from "../PositionFactory";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";

export abstract class Declaration extends Expression {

    constructor(
        position: Position,
        public readonly id: Declarator,
    ){
        super(position);
    }

}