import { Position } from "../PositionFactory";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class IfStatement extends Expression {

    constructor(
        position: Position,
        public readonly test: Expression,
        public readonly consequent: Statement,
        public readonly alternate?: Statement,
    ){
        super(position);
    }

}