import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { ScopeNode } from "./ScopeNode";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";
import { VariableDeclaration } from "./VariableDeclaration";

export class ForStatement extends Statement implements ScopeNode {

    constructor(
        location: SourceLocation,
        public readonly left: VariableDeclaration,
        public readonly right: Expression,
        public readonly body: BlockStatement,
    ){
        super(location);
    }

    get isScope(): true {
        return true;
    }

    getStatements(): Statement[] {
        return [this.left];
    }

    toString(user?: boolean) {
        return `for ${this.left.toString(user)} in ${this.right.toString(user)} ${this.body.toString(user)}`
    }

}