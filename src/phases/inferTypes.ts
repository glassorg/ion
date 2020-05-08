import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import Analysis from "../ast/Analysis";
import Expression from "../ast/Expression";
import Literal from "../ast/Literal";
import LiteralType from "../ast/LiteralType";
import * as ast from "../ast"

// that is some typescript kung fu right there.
const getPredecessors: { [P in keyof typeof ast]?: (e: InstanceType<typeof ast[P]>) => Iterator<Expression>} = {
    *BinaryExpression(node) {
        yield node.left
        yield node.right
    },
    *Literal(node) {
    },
    *FunctionExpression(node) {
        // yield node.parameters
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
