import { Position } from "../PositionFactory";
import { Expression } from "./Expression";
import { Identifier } from "./Identifier";

export class MemberExpression extends Expression {

    constructor(
        position: Position,
        public readonly object: Expression,
        public readonly property: Identifier,
    ){
        super(position);
    }

}