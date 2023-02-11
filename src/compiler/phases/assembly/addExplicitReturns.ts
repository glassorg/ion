import { getFinalStatements } from "../../analysis/getFinalStatements";
import { Assembly } from "../../ast/Assembly";
import { ExpressionStatement } from "../../ast/ExpressionStatement";
import { FunctionExpression } from "../../ast/FunctionExpression";
import { ReturnStatement } from "../../ast/ReturnStatement";
import { Lookup, skip, traverse } from "../../common/traverse";
import { SemanticError } from "../../SemanticError";

export function addExplicitReturns(assembly: Assembly): Assembly {
    let errors: Error[] = [];
    let lookup = new Lookup();
    assembly = traverse(assembly, {
        lookup,
        enter(node) {
            if (node instanceof FunctionExpression) {
                return skip;
            }
        },
        leave(node) {
            if (node instanceof FunctionExpression) {
                let statements = new Set(getFinalStatements(node.body));
                if (statements.size === 0) {
                    errors.push(new SemanticError("Functions must return an expression", node));
                }
                node = traverse(node, {
                    leave(innerNode) {
                        if (statements.has(innerNode)) {
                            if (innerNode instanceof ExpressionStatement) {
                                return new ReturnStatement(innerNode.location, innerNode.expression);
                            }
                            else if (!(innerNode instanceof ReturnStatement)) {
                                throw new SemanticError(`Invalid function return value`, innerNode);
                            }
                        }
                    }
                })
            }
            return node;
        }
    })
    return assembly;
}
