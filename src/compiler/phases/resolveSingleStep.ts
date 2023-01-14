import { AstNode } from "../ast/AstNode";
import { AnalyzedDeclaration, AnalyzedDeclarationMap, isRootDeclaration, ParsedDeclaration } from "../ast/Declaration";
import { skip, traverseWithContext } from "../common/traverse";

type Log = (stageName: string, declaration: ParsedDeclaration) => void;

export function resolveSingleStep(root: AnalyzedDeclaration, log: Log, externals: AnalyzedDeclaration[], phaseName: string): AnalyzedDeclaration
export function resolveSingleStep(root: AnalyzedDeclarationMap, log: Log): AnalyzedDeclarationMap
export function resolveSingleStep(root: AnalyzedDeclaration | AnalyzedDeclarationMap, log: Log, externals: AnalyzedDeclaration[] = [], phaseName = "resolveSingleStep"): AnalyzedDeclarationMap | AnalyzedDeclaration {
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
                if (before.toString() === "`sample.a`") {
                    debugger;
                }
                node = node.maybeResolve(c) ?? node;
                if (before.toString() === "`sample.a`") {
                    console.log(before + " => " + node);
                }
            }
            if (isRootDeclaration(node)) {
                if (before !== node) {
                    log(phaseName, node);
                }
            }
            return node;
        }
    }))
}