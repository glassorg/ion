import { Position } from "../PositionFactory";
import { Expression } from "./Expression";
import { Token } from "./Token";

export class PstGroup extends Expression {

    constructor(
        position: Position,
        public readonly open: Token,
        public readonly close: Token,
        public readonly value?: Expression,
    ){
        super(position);
    }

}