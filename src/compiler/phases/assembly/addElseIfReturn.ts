import { Assembly } from "../../ast/Assembly";
import { AstNode } from "../../ast/AstNode";
import { BlockStatement } from "../../ast/BlockStatement";
import { IfStatement } from "../../ast/IfStatement";
import { ReturnStatement } from "../../ast/ReturnStatement";
import { SourceLocation } from "../../ast/SourceLocation";
import { Statement } from "../../ast/Statement";
import { traverse } from "../../common/traverse";

export function toBlockStatement(statements: Statement[]): BlockStatement {
    return new BlockStatement(
        SourceLocation.merge(statements[0].location, statements[statements.length - 1].location),
        statements
    );
}

export function addElseIfReturn(assembly: Assembly): Assembly {
    assembly = traverse(assembly, {
        leave(node: AstNode) {
            if (node instanceof BlockStatement) {
                let block: BlockStatement = node;
                for (let i = block.statements.length - 2; i >= 0; i--) {
                    let child = block.statements[i];
                    if (child instanceof IfStatement && !child.alternate) {
                        const last = child.consequent.statements[child.consequent.statements.length - 1];
                        if (last instanceof ReturnStatement) {
                            // consume all of the rest and add to an else alternate
                            block = block.patch({
                                statements: [...block.statements.slice(0, i), child.patch({
                                    alternate: toBlockStatement(block.statements.slice(i + 1))
                                })]
                            })
                        }
                    }
                }
                node = block;
            }
            return node;
        }
    })
    return assembly;
}
