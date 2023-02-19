import { Assembly } from "../../ast/Assembly";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { AstNode } from "../../ast/AstNode";
import { BlockStatement } from "../../ast/BlockStatement";
import { ConditionalAssertion } from "../../ast/ConditionalAssertion";
import { ExpressionStatement } from "../../ast/ExpressionStatement";
import { IfStatement } from "../../ast/IfStatement";
import { Reference } from "../../ast/Reference";
import { isTypeName, isValidId } from "../../common/names";
import { traverse, traverseWithContext } from "../../common/traverse";

function getReferences(
    root: AstNode,
    predicate: ((ref: Reference) => boolean) = (ref) => isValidId(ref.name) && !isTypeName(ref.name)
) {
    let refs = new Map<string,Reference>();
    traverse(root, {
        leave(node) {
            if (node instanceof Reference && predicate(node)) {
                refs.set(node.name, node);
            }
        }
    })
    return refs.values();
}

export function insertConditionals(root: Assembly) {
    let result = traverseWithContext(root, (c) => {
        return {
            leave(node, ancestors) {
                // // we need to also insert conditional assignments into the right hand side of chained &&, || expressions.
                // if (node instanceof LogicalExpression) {
                //     // just && for now.
                //     const debug = node.toString().indexOf("chained_conditionals") >= 0;
                //     if (debug) {
                //         // console.log("_______" + node);
                //         let {left, right} = node;
                //         let refs = getReferences(left);
                //         for (let ref of refs) {
                //             right = insertConditionalAssignment(right, ref, node.operator === "||", true);
                //         }
                //         node = node.patch({ right });
                //     }
                // }

                if (node instanceof IfStatement) {
                    let ifStatement = node;
                    // insert conditional assignments here.
                    let refs = getReferences(ifStatement.test);
                    for (let ref of refs) {
                        ifStatement = ifStatement.patch({
                            consequent: insertConditionalAssignment(ifStatement.consequent, ref, false)
                        });
                        //  we always insert an else even if it doesn't exist.
                        //  it's necessary for correct phi result merging after conditional.
                        ifStatement = ifStatement.patch({
                            alternate: insertConditionalAssignment(node.alternate ?? new BlockStatement(node.location, []), ref, true)
                        });
                    }
                    node = ifStatement;
                }
                return node;
            }
        }
    })

    return result;
}

function insertConditionalAssignment(node: BlockStatement, ref: Reference, negate: boolean, isChained = false): BlockStatement {
    const { location } = node;
    const assignment = new ExpressionStatement(location, 
        new AssignmentExpression(
            location,
            ref,
            new ConditionalAssertion(location, ref, negate, isChained)
        )
    );
    return node.patch({ statements: [assignment, ...node.statements]});
}

