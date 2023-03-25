import { Assembly } from "../../ast/Assembly";
import { PstGroup } from "../../ast/PstGroup";
import { traverse } from "../../common/traverse";
import { SemanticError } from "../../SemanticError";

export function postParser(assembly: Assembly) {
    return traverse(assembly, {
        leave(node) {
            if (node instanceof PstGroup) {
                if (node.value == null) {
                    throw new SemanticError(`Unexpected: ${node}`, node);
                }
                return node.value;
            }
        }
    });
}