import { BlockStatement } from "../ast/BlockStatement";
import { IfStatement } from "../ast/IfStatement";
import { Statement } from "../ast/Statement";

export default function *getFinalStatements(node: Statement): Generator<Statement> {
    if (node instanceof BlockStatement) {
        let last = node.statements[node.statements.length - 1];
        if (last) {
            yield* getFinalStatements(last);
        }
    }
    else if (node instanceof IfStatement) {
        yield* getFinalStatements(node.consequent)
        if (node.alternate) {
            yield* getFinalStatements(node.alternate)
        }
    }
    else {
        yield node
    }
}