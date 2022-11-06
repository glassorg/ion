import { Position } from "../PositionFactory";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class ReturnStatement extends Statement {

    constructor(
        position: Position,
        public readonly argument: Expression,
    ){
        super(position);
    }

}