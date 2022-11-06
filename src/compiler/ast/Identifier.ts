import { Position } from "../PositionFactory";
import { AstNode } from "./AstNode";

export class Identifier extends AstNode {

    constructor(
        position: Position,
        public readonly name: string,
    ){
        super(position);
    }

    get isIdentifier() {
        return true;
    }

}