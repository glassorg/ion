import { Expression } from "./Expression";
import { ExpressionStatement } from "./ExpressionStatement";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export class BlockStatement extends Statement {

    public readonly statements: Statement[];

    constructor(
        location: SourceLocation,
        statements: (Statement | Expression)[],
    ) {
        super(location);
        this.statements = statements.map(node => node instanceof Statement ? node : new ExpressionStatement(node.location, node));
    }

    toString() {
        return this.toBlockString(this.statements);
    }

}