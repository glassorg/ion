import { Position } from "../PositionFactory";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class ExpressionStatement extends Statement {

    constructor(
        position: Position,
        public readonly expression: Expression,
    ){
        super(position);
    }

}