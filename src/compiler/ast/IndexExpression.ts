import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class IndexExpression extends Expression {

    constructor(
        position: Position,
        public readonly object: Expression,
        public readonly index: Expression,
    ){
        super(position);
    }

}