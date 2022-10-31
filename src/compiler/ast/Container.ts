import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class Container<T extends Expression> extends Expression {

    constructor(
        position: Position,
        public readonly nodes: T[],
    ){
        super(position);
    }

}