import { Expression } from "./Expression";
import { ExpressionStatement } from "./ExpressionStatement";
import { Scope } from "./Scope";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export class BlockStatement extends Statement implements Scope {

    public readonly statements: Statement[];

    constructor(
        location: SourceLocation,
        statements: (Statement | Expression)[],
    ) {
        super(location);
        this.statements = statements.map(node => node instanceof Statement ? node : new ExpressionStatement(node.location, node));
    }

    get isScope(): true {
        return true;
    }

    toString() {
        return this.toBlockString(this.statements);
    }

}