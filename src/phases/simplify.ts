import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import Analysis from "../ast/Analysis";
import Expression from "../ast/Expression";
import Literal from "../ast/Literal";
import LiteralType from "../ast/LiteralType";
import * as ast from "../ast";
import createScopeMaps, { ScopeMap, ScopeMaps } from "../createScopeMaps";
import getSortedTypedNodes from "./getSortedTypedNodes";

const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
}

// that is some typescript kung fu right there.
export const simplifyFunctions: { [P in keyof typeof ast]?: (e: InstanceType<typeof ast[P]>, resolved: { get<T>(t: T): T }, scope: ScopeMaps) => any} = {
    BinaryExpression(node) {
        if (Literal.is(node.left) && Literal.is(node.right)) {
            let value = ops[node.operator](node.left.value, node.right.value)
            return new Literal({ location: node.location, value })
        }
    },
    UnionType(node) {
    },
    Literal(node) {
    },
    ClassDeclaration(node) {
    },
    Parameter(node) {
    },
    VariableDeclaration(node) {
    },
    FunctionExpression(node) {
    },
    Reference(node) {
    },
    MemberExpression(node) {
    },
    ArrayExpression(node) {
    },
    CallExpression(node) {
    },
    TemplateReference(node) {
    },
    ConstrainedType(node) {
    },
    UnaryExpression(node) {
    }
}

export default function simplify(node: Expression, resolved: Map<ast.Node,ast.Node>, scopes: ScopeMaps) {
    let func = simplifyFunctions[node.constructor.name]
    return func?.(node, resolved, scopes) ?? node
}
