import { AstNode } from "../ast/AstNode";
import { AnalyzedDeclaration, AnalyzedDeclarationMap, isRootDeclaration, ParsedDeclaration } from "../ast/Declaration";
import { skip, traverseWithContext } from "../common/traverse";

type Log = (stageName: string, declaration: ParsedDeclaration) => void;

export function resolveSingleStep(root: AnalyzedDeclaration, log: Log, externals: AnalyzedDeclaration[]): AnalyzedDeclaration
export function resolveSingleStep(root: AnalyzedDeclarationMap, log: Log): AnalyzedDeclarationMap
export function resolveSingleStep(root: AnalyzedDeclaration | AnalyzedDeclarationMap, log: Log, externals: AnalyzedDeclaration[] = []): AnalyzedDeclarationMap | AnalyzedDeclaration {
    return traverseWithContext(root, externals, c => ({
        enter(node) {
            if (isRootDeclaration(node)) {
                if (node.resolved) {
                    return skip;
                }
            }
        },
        leave(node) {
            const before = node;
            if (node instanceof AstNode) {
                node = node.maybeResolve(c) ?? node;
            }
            if (isRootDeclaration(node)) {
                if (before !== node) {
                    log("resolveSingleStep", node);
                }
            }
            return node;
        }
    }))
}