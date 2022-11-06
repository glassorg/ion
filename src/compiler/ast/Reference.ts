import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class Reference extends Expression {

    constructor(
        position: Position,
        public readonly name: string,
    ){
        super(position);
    }

    get isReference() {
        return true;
    }

}