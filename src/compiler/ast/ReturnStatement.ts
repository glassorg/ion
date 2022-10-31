import { Position } from "../PositionFactory";
import { AstNode } from "./AstNode";
import { Expression } from "./Expression";

export class ReturnStatement extends AstNode {

    constructor(
        position: Position,
        public readonly argument: Expression,
    ){
        super(position);
    }

}