import { AstNode } from "./AstNode";

export function isScope(node: any) {
    return node?.isScope === true;
}

export interface Scope extends AstNode {
    isScope: true
}
