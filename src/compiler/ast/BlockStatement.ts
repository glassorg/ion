import { Expression } from "./Expression";
import { ExpressionStatement } from "./ExpressionStatement";
import { ScopeNode } from "./ScopeNode";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export class BlockStatement extends Statement implements ScopeNode {

    public readonly statements: Statement[];

    constructor(
        location: SourceLocation,
        statements: (Statement | Expression)[],
    ) {
        super(location);
        this.statements = statements.map(node => node instanceof Statement ? node : new ExpressionStatement(node.location, node));
    }

    get firstStatement(): Statement | undefined {
        return this.statements[0];
    }

    get lastStatement(): Statement | undefined {
        return this.statements[this.statements.length - 1];
    }

    *dependencies() {
        yield* this.statements;
    }

    get isScope(): true {
        return true;
    }

    toString(user?: boolean) {
        return this.toBlockString(user, this.statements);
    }

}