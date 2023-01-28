import { Assembly } from "../../ast/Assembly";
import { Expression } from "../../ast/Expression";
import { traverseWithContext } from "../../common/traverse";

export const repeatSuffix = "_N";
export function resolveSingleStep_N(root: Assembly): Assembly {
    return traverseWithContext(root, c => {
        return ({
            leave(node) {
                if (node instanceof Expression) {
                    node = node.maybeResolve(c) ?? node;
                }
                return node;
            }
        });
    })
}