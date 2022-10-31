import { Position } from "../PositionFactory";
import { Expression } from "./Expression";
import { Token } from "./Token";

export class PstCallExpression extends Expression {

    constructor(
        position: Position,
        public readonly callee: Expression,
        public readonly args: Expression | undefined,
    ){
        super(position);
    }

}