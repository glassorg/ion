import { AstNode } from "./AstNode";
import { Statement } from "./Statement";

export function isScopeNode(node: any): node is ScopeNode {
    return node?.isScope === true;
}

export interface ScopeNode extends AstNode {
    isScope: true
    getStatements(): Statement[]
}
