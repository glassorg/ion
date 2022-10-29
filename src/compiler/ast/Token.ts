import { PositionFactory } from "../PositionFactory";
import { AstNode } from "./AstNode";

export class Token extends AstNode {

    constructor(
        public readonly type: string,
        // public readonly source: string,
        public readonly value: string,
        position: number = -1,
    ) {
        super(position);
    }

    static merge(left: Token, right: Token) {
        return left.patch({
            value: left.value + right.value,
            position: PositionFactory.merge(left.position, right.position)
        })
    }

}