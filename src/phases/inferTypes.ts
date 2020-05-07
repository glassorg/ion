import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import Analysis from "../ast/Analysis";
import Expression from "../ast/Expression";
import Literal from "../ast/Literal";
import LiteralType from "../ast/LiteralType";
import * as ast from "../ast"
import BinaryExpression from "../ast/BinaryExpression";

const getPredecessors: { [P in keyof typeof ast]?: (e) => Iterator<Expression>} = {
    *BinaryExpression(node: BinaryExpression) {
    }
}

function getPredecessorExpressions(e: Expression) {

}

export default function inferTypes(root: Analysis) {
    return traverse(root, {
        leave(node) {
            if (Literal.is(node)) {
                return node.patch({ type: new LiteralType({ location: node.location, literal: node }) })
            }
        }
    })
}
