import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import Analysis from "../ast/Analysis";
import Expression from "../ast/Expression";
import Literal from "../ast/Literal";
import * as ast from "../ast";
import createScopeMaps, { ScopeMap, ScopeMaps } from "../createScopeMaps";
import getSortedTypedNodes from "./getSortedTypedNodes";
import simplify from "./simplify";
import { getAbsoluteName, SemanticError } from "../common";

function getTypeReference(name: string) {
    return new ast.TypeReference({ name: getAbsoluteName(`ion.${name}`, name)})
}

const literalTypes = {
    boolean: getTypeReference("Boolean"),
    number: getTypeReference("Number"),
    object: getTypeReference("Null"),
    string: getTypeReference("String"),
}

// that is some typescript kung fu right there.
export const inferType: { [P in keyof typeof ast]?: (e: InstanceType<typeof ast[P]>, resolved: { get<T>(t: T): T }, scope: ScopeMaps) => any} = {
    BinaryExpression(node, resolved) {
        // for now just use the left type
        return resolved.get(node.left).type
    },
    Literal(node) {
        let type = literalTypes[typeof node.value]
        if (type == null) {
            throw SemanticError(`Cannot find type`, type)
        }
        return type
    },
    ClassDeclaration(node) {
    },
    Parameter(node) {
    },
    VariableDeclaration(node, resolved) {
        if (node.value) {
            let value = resolved.get(node.value)
            return value.type
        }
    },
    FunctionExpression(node) {
    },
    Reference(node, resolved, scopes) {
        let scope = scopes.get(node)
        let declaration = resolved.get(scope[node.name])
        return declaration.type
    },
    MemberExpression(node) {
    },
    ArrayExpression(node) {
    },
    CallExpression(node) {
    },
    UnaryExpression(node) {
        return node.argument.type
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
        if (result.type == null) {
            let func = inferType[result.constructor.name]
            let type = func?.(
                node,   // Must be original node else scopes won't work
                resolved,
                scopes
            )
            if (type != null) {
                result = node.patch({ type })
                resolved.set(node, result)
            }
        }
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
