import { Position } from "../PositionFactory";
import { Expression } from "./Expression";

export class MemberExpression extends Expression {

    constructor(
        position: Position,
        public readonly object: Expression,
        public readonly property: Expression,
        public readonly computed: boolean,
    ){
        super(position);
    }

}