import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class Literal<T> extends Expression {

    constructor(
        position: Position,
        public readonly value: T,
    ){
        super(position);
    }

}