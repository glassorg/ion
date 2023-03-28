import { ArrayExpression } from "../../ast/ArrayExpression";
import { Assembly } from "../../ast/Assembly";
import { PstGroup } from "../../ast/PstGroup";
import { SequenceExpression } from "../../ast/SequenceExpression";
import { traverse } from "../../common/traverse";
import { TokenNames } from "../../parser/tokenizer/TokenTypes";
import { SemanticError } from "../../SemanticError";

export function postParser(assembly: Assembly) {
    return traverse(assembly, {
        leave(node) {
            if (node instanceof PstGroup) {
                if (node.open.type === TokenNames.OpenBracket) {
                    const elements = SequenceExpression.flatten(node.value);
                    return new ArrayExpression(node.location, elements);
                }
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