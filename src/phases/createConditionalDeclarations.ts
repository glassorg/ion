import { Analysis, IfStatement, BinaryExpression, BlockStatement, Expression, Reference, VariableDeclaration, ConditionalDeclaration, DotExpression, Id } from "../ast";
import { traverse, skip } from "../Traversal";
import toCodeString from "../toCodeString";
import { getNodesOfType, isLowerCase } from "../common";
// import { conditionalChainToBinaryExpression } from "./createConditionalChains";

export default function createConditionalDeclarations(root: Analysis) {
    return traverse(root, {
        enter(node) {
        },
        leave(node) {
            if (IfStatement.is(node) && node.consequent.statements.length > 0) {
                //  find all unique named references
                //  create a new ConditionalDeclaration for each, replacing named refs with DotExpression
                // find all variable declaration references
                let refs = new Set(getNodesOfType(node.test, Reference.is).map(n => n.name).filter(isLowerCase))
                // now we have to redeclare more strongly typed stuff.
                let newDeclarations = new Array<ConditionalDeclaration>()
                for (let name of refs) {
                    // let assert = node.test
                    // removed because this causes recursive insertions and forces false declarations of '.'
                    // let assert = name === "." ? node.test : traverse(node.test, {
                    //     leave(node) {
                    //         if (Reference.is(node) && node.name === name) {
                    //             return new DotExpression({})
                    //         }
                    //     }
                    // })
                    // if (ConditionalChain.is(assert)) {
                    //     assert = conditionalChainToBinaryExpression(assert)
                    // }
                    newDeclarations.push(new ConditionalDeclaration({ location: node.test.location, id: new Id({ name }) }))
                }
                return node.patch({
                    consequent: new BlockStatement({ statements: [...newDeclarations, ...node.consequent.statements] })
                })
            }
        }
    })
}
