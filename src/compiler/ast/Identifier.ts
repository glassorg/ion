import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class Identifier extends Expression {

    constructor(
        position: Position,
        public readonly name: string,
    ){
        super(position);
    }

}