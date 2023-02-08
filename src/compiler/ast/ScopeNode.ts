import { AstNode } from "./AstNode";

export function isScopeNode(node: any): node is ScopeNode {
    return node?.isScope === true;
}

export interface ScopeNode extends AstNode {
    isScope: true
}
