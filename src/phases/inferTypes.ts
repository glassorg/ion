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
    return new ast.Reference({ name: getAbsoluteName(`ion.${name}`, name)})
}

const literalTypes = {
    boolean: getTypeReference("Boolean"),
    number: getTypeReference("Number"),
    object: getTypeReference("Null"),
    string: getTypeReference("String"),
}

// that is some typescript kung fu right there.
export const inferType: { [P in keyof typeof ast]?: (originalNode: InstanceType<typeof ast[P]>, currentNode: InstanceType<typeof ast[P]>, resolved: { get<T>(t: T): T }, scope: ScopeMaps) => any} = {
    BinaryExpression(originalNode, currentNode, resolved) {
        // for now just use the left type
        return resolved.get(originalNode.left).type
    },
    Literal(originalNode, currentNode) {
        let jstypeof = typeof currentNode.value
        let type = literalTypes[jstypeof]
        if (type == null) {
            throw SemanticError(`Cannot find type ${jstypeof}`, type)
        }
        return type
    },
    ClassDeclaration(originalNode) {
    },
    Parameter(originalNode, currentNode, resolved, scope) {
        return inferType.VariableDeclaration?.apply(this, arguments as any)
    },
    VariableDeclaration(originalNode, currentNode, resolved) {
        if (originalNode.value) {
            let value = resolved.get(originalNode.value)
            return value.type
        }
    },
    FunctionExpression(originalNode) {
    },
    Reference(originalNode, currentNode, resolved, scopes) {
        let scope = scopes.get(originalNode)
        let declaration = resolved.get(scope[originalNode.name])
        return declaration.type
    },
    MemberExpression(originalNode) {
    },
    ArrayExpression(originalNode) {
    },
    CallExpression(originalNode) {
    },
    UnaryExpression(originalNode) {
        return originalNode.argument.type
    }
}

export default function inferTypes(root: Analysis) {
    let scopes = createScopeMaps(root)
    let resolved = new Map<ast.Typed,ast.Node>()
    let sorted = getSortedTypedNodes(root, scopes)
    for (let originalNode of sorted) {
        // first try to simplify
        let currentNode = simplify(originalNode, resolved, scopes) ?? originalNode
        resolved.set(originalNode, currentNode)
        // then try to infer types
        if (currentNode.type == null) {
            let func = inferType[currentNode.constructor.name]
            let type = func?.(
                originalNode,   // Must be original node else scopes won't work
                currentNode,
                resolved,
                scopes
            )
            if (type != null) {
                currentNode = currentNode.patch({ type })
            }
            resolved.set(originalNode, currentNode)
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
