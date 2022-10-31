import { AstNode } from "./ast/AstNode";
import { Position } from "./PositionFactory";

export class SemanticError extends Error {

    positions: Position[];

    constructor(message: string, ...nodes: (AstNode | Position | undefined)[]) {
        super(message);
        this.name = this.constructor.name;
        this.positions = nodes.filter(node => node != null).map(node => node instanceof AstNode ? node.position : node) as number[];
    }

}