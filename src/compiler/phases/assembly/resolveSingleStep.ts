import { Assembly } from "../../ast/Assembly";
import { AstNode } from "../../ast/AstNode";
import { isRootDeclaration } from "../../ast/Declaration";
import { skip, traverseWithContext } from "../../common/traverse";

export const repeatSuffix = "_N";
export function resolveSingleStep_N(root: Assembly): Assembly {
    return traverseWithContext(root, c => {
        debugger;
        return ({
            enter(node) {
                if (isRootDeclaration(node)) {
                    if (node.resolved) {
                        return skip;
                    }
                }
            },
            leave(node) {
                if (node instanceof AstNode) {
                    node = node.maybeResolve(c) ?? node;
                }
                return node;
            }
        });
    })
}