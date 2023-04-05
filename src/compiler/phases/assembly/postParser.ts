import { ArgPlaceholder } from "../../ast/ArgPlaceholder";
import { ArrayExpression } from "../../ast/ArrayExpression";
import { Assembly } from "../../ast/Assembly";
import { FunctionExpression } from "../../ast/FunctionExpression";
import { PstGroup } from "../../ast/PstGroup";
import { Reference } from "../../ast/Reference";
import { SequenceExpression } from "../../ast/SequenceExpression";
import { ParameterDeclaration } from "../../ast/VariableDeclaration";
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
            if (node instanceof FunctionExpression) {
                const names = new Map(node.parameters.map((p,i) => [p.id.name, i]));
                let replaced = 0;
                const parameters = node.parameters.map((p,i) => {
                    let param = traverse(p, {
                        leave(n) {
                            if (n instanceof Reference) {
                                if (n.name === p.id.name) {
                                    throw new SemanticError(`Cannot reference self in type declaration`, p.id, n);
                                }
                                const index = names.get(n.name);
                                if (index != null) {
                                    replaced++;
                                    return new ArgPlaceholder(n.location, index);
                                }
                            }
                        }
                    })
                    return param;
                });
                if (replaced) {
                    return node.patch({ parameters });
                }
            }
        }
    });
}