import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class CallExpression extends Expression {

    constructor(
        position: Position,
        public readonly callee: Expression,
        public readonly args: Expression[],
    ){
        super(position);
    }

}