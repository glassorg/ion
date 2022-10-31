import { Position } from "../PositionFactory";
import { Statement } from "./Statement";

export class BlockStatement extends Statement {

    constructor(
        position: Position,
        public readonly statements: Statement[],
    ) {
        super(position);
    }

}