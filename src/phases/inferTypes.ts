import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import Analysis from "../ast/Analysis";
import Expression from "../ast/Expression";
import Literal from "../ast/Literal";
import LiteralType from "../ast/LiteralType";
import * as ast from "../ast"
import createScopeMaps, { ScopeMap } from "../createScopeMaps";

function getReturnStatements(node: ast.FunctionExpression): ast.ReturnStatement[] {
    let statements: ast.ReturnStatement[] = []
    traverse(node, {
        enter(node) {
            if (ast.CallExpression.is(node)) {
                return skip
            }
        },
        leave(node) {
            if (ast.ReturnStatement.is(node)) {
                statements.push(node)
            }
        }
    })
    return statements
}

// that is some typescript kung fu right there.
const getPredecessors: { [P in keyof typeof ast]?: (e: InstanceType<typeof ast[P]>, scope: ScopeMap) => Iterator<ast.Typed>} = {
    *BinaryExpression(node) {
        yield node.left
        yield node.right
    },
    *Literal(node) {
    },
    *FunctionExpression(node) {
        for (let param of node.parameters) {
            yield param
        }
        for (let returnStatement of getReturnStatements(node)) {
            yield returnStatement.value   
        }
    },
    *Reference(node, scope) {
        yield scope[node.name]
    },
    *MemberExpression(node) {
        yield node.object
        if (Expression.is(node.property)) {
            yield node.property
        }
    },
    *ArrayExpression(node) {
        for (let element of node.elements) {
            yield element
        }
    },
    *CallExpression(node) {
        yield node.callee
        for (let arg of node.arguments) {
            yield arg.value
        }
    },
}

function getPredecessorExpressions(e: Expression) {
}

export default function inferTypes(root: Analysis) {
    let scopes = createScopeMaps(root)
    let types = new Map<ast.Typed,Expression>()

    return traverse(root, {
        leave(node) {
            if (Literal.is(node)) {
                return node.patch({ type: new LiteralType({ location: node.location, literal: node }) })
            }
        }
    })
}
