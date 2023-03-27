import { Assembly } from "../../ast/Assembly";
import { ComparisonExpression } from "../../ast/ComparisonExpression";
import { Literal } from "../../ast/Literal";
import { PstGroup } from "../../ast/PstGroup";
import { TypeExpression } from "../../ast/TypeExpression";
import { traverse } from "../../common/traverse";
import { SemanticError } from "../../SemanticError";

export function postParser(assembly: Assembly) {
    return traverse(assembly, {
        leave(node, ancestors) {
            if (node instanceof PstGroup) {
                if (node.value == null) {
                    throw new SemanticError(`Unexpected: ${node}`, node);
                }
                return node.value;
            }
            // if (node instanceof TypeExpression) {
            //     for (let c of node.constraints) {
            //         if (c.toString() === `length == 10`)
            //         // if (c instanceof ComparisonExpression && c.operator === "==" && c.right instanceof Literal) {
            //         //     throw new SemanticError(`Use '${c.left} : ${c.right}' instead`, c);
            //         // }
            //     }
            // }
        }
    });
}