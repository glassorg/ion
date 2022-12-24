import { AstNode } from "../ast/AstNode";
import { AnalyzedDeclaration, ResolvedDeclaration } from "../ast/Declaration";
import { traverseWithContext } from "../common/traverse";

export function resolveSingleStep(root: AnalyzedDeclaration, externals: ResolvedDeclaration[]): AnalyzedDeclaration {
    return traverseWithContext(root, externals, c => ({
        leave(node) {
            if (node instanceof AstNode) {
                node = node.maybeResolve(c) ?? node;
            }
            return node;
        }
    }))
}