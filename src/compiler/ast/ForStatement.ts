import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class PstForLoop extends Expression {

    constructor(
        position: Position,
        public readonly left: Expression,
        public readonly right: Expression,
        public readonly body: Expression,
    ){
        super(position);
    }

}