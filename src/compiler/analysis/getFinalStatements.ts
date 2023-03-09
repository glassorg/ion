import { BlockStatement } from "../ast/BlockStatement";
import { FunctionExpression } from "../ast/FunctionExpression";
import { IfStatement } from "../ast/IfStatement";
import { ReturnStatement } from "../ast/ReturnStatement";
import { Statement } from "../ast/Statement";
import { skip, traverse } from "../common/traverse";

export function getFinalStatements(node: Statement, statements = new Set<Statement>()): Set<Statement> {
    if (node instanceof BlockStatement) {
        let last = node.statements[node.statements.length - 1];
        if (last) {
            getFinalStatements(last, statements);
        }
    }
    else if (node instanceof IfStatement) {
        getFinalStatements(node.consequent, statements);
        if (node.alternate) {
            getFinalStatements(node.alternate, statements);
        }
    }
    else {
        statements.add(node);
    }
    return statements;
}

export function getReturnStatements(root: Statement): ReturnStatement[] {
    const statements: ReturnStatement[] = [];
    traverse(root, {
        enter(node) {
            if (node instanceof FunctionExpression) {
                // don't get returns from nested functions.
                return skip;
            }
        },
        leave(node) {
            if (node instanceof ReturnStatement) {
                statements.push(node);
            }
        }
    });
    return statements;
}