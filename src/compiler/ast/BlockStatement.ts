import { Position } from "../PositionFactory";
import { Expression } from "./Expression";
import { ExpressionStatement } from "./ExpressionStatement";
import { Statement } from "./Statement";

export class BlockStatement extends Statement {

    public readonly statements: Statement[];

    constructor(
        position: Position,
        statements: (Statement | Expression)[],
    ) {
        super(position);
        this.statements = statements.map(node => node instanceof Statement ? node : new ExpressionStatement(node.position, node));
    }

}