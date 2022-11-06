import { Position } from "../PositionFactory";
import { AstNode } from "./AstNode";
import { Declaration } from "./Declaration";

export class PstModule extends AstNode {

    constructor(
        position: Position,
        public readonly name: string,
        public readonly statements: Declaration[],
    ){
        super(position);
    }

}