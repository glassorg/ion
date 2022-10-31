import { Position } from "../PositionFactory";
import { Container } from "./Container";
import { Expression } from "./Expression";

export class PstModule extends Container<Expression> {

    constructor(
        position: Position,
        nodes: Expression[],
        public readonly name: string,
    ){
        super(position, nodes);
    }

}