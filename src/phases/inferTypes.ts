import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import Analysis from "../ast/Analysis";
import Expression from "../ast/Expression";
import Literal from "../ast/Literal";
import LiteralType from "../ast/LiteralType";
import * as ast from "../ast";
import createScopeMaps, { ScopeMap, ScopeMaps } from "../createScopeMaps";
import getSortedTypedNodes from "./getSortedTypedNodes";
import simplify from "./simplify";

// that is some typescript kung fu right there.
export const inferTypeFunctions: { [P in keyof typeof ast]?: (e: InstanceType<typeof ast[P]>, resolved: { get<T>(t: T): T }, scope: ScopeMaps) => any} = {
    BinaryExpression(node) {
    },
    UnionType(node) {
    },
    IntersectionType(node) {
    },
    Literal(node) {
        return node.patch({ type: new LiteralType({ location: node.location, literal: node }) })
    },
    LiteralType(node) {
    },
    ClassDeclaration(node) {
    },
    Parameter(node) {
    },
    VariableDeclaration(node) {
    },
    FunctionExpression(node) {
    },
    Reference(node, scopes) {
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

export default function inferTypes(root: Analysis) {
    let scopes = createScopeMaps(root)
    let resolved = new Map<ast.Typed,ast.Node>()
    let sorted = getSortedTypedNodes(root, scopes)
    for (let node of sorted) {
        // first try to simplify
        let result = simplify(node, resolved, scopes) ?? node
        resolved.set(node, result)
        // then try to infer types
        let func = inferTypeFunctions[result.constructor.name]
        result = func?.(result, resolved, scopes) ?? result
        resolved.set(node, result)
    }

    return traverse(root, {
        merge(node, changes, helper) {
            let result = resolved.get(node)
            if (result) {
                return helper.patch(result, changes)
            }
        }
    })
}
