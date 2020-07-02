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
import toCodeString from "../toCodeString";

function getTypeReference(name: string) {
    return new ast.Reference({ name: getAbsoluteName(`ion.${name}`, name)})
}

const literalTypes = {
    boolean: getTypeReference("Boolean"),
    number: getTypeReference("Number"),
    object: getTypeReference("Null"),
    string: getTypeReference("String"),
}

function getMemberType(node: ast.MemberExpression, objectType: ast.TypeExpression | ast.ClassDeclaration, member: String | ast.TypeExpression): ast.Reference | ast.TypeExpression {
    if (ast.ClassDeclaration.is(objectType) && typeof member === "string") {
        let declaration = objectType.declarations.get(member)
        if (declaration == null) {
            throw SemanticError(`Member '${member}' not found on ${objectType.id.name}`, node)
        }
        if (declaration.type == null) {
            throw SemanticError(`Declaration not typed`, declaration)
        }
        return declaration.type
    }
    throw new Error("Not Implemented: getMemberType for " + objectType.constructor.name)
}

function getTypeExpressionOrClassDeclaration(node: Expression, resolved: Resolved, scopes: ScopeMaps): ast.TypeExpression | ast.ClassDeclaration {
    if (ast.TypeDeclaration.is(node)) {
        return getTypeExpressionOrClassDeclaration(node.value, resolved, scopes)
    }
    if (ast.ClassDeclaration.is(node) || ast.TypeExpression.is(node)) {
        return node
    }
    if (ast.Parameter.is(node)) {
        if (node.type == null) {
            throw SemanticError(`Parameter type not resolved`, node)
        }
        return getTypeExpressionOrClassDeclaration(node.type, resolved, scopes)
    }
    if (ast.Reference.is(node)) {
        let scope = scopes.get(node)
        let referencedNode = scope[node.name]
        return getTypeExpressionOrClassDeclaration(referencedNode, resolved, scopes)
    }
    throw new Error(`Cannot find TypeExpression or ClassDeclaration: ${toCodeString(node)}`)
}

type Resolved = { get<T>(t: T): T }

// that is some typescript kung fu right there.
export const inferType: { [P in keyof typeof ast]?: (node: InstanceType<typeof ast[P]>, resolved: Resolved, scope: ScopeMaps) => any} = {
    BinaryExpression(node, resolved) {
        // for now just use the left type
        return { type: resolved.get(node.left).type }
    },
    Literal(node) {
        let jstypeof = typeof node.value
        let type = literalTypes[jstypeof]
        if (type == null) {
            throw SemanticError(`Cannot find type ${jstypeof}`, type)
        }
        return { type }
    },
    ClassDeclaration(node) {
    },
    Parameter(node, resolved, scopes) {
        return inferType.VariableDeclaration?.apply(this, arguments as any)
    },
    VariableDeclaration(node, resolved) {
        if (node.value) {
            let value = resolved.get(node.value)
            return { type: value.type }
        }
    },
    FunctionExpression(func, resolved) {
        // traverse and find all return types
        let returnTypes: Array<ast.TypeExpression | ast.Reference> = []
        traverse(func.body, {
            enter(node) {
                if (ast.ReturnStatement.is(node)) {
                    let resolvedValue = resolved.get(node.value)
                    if (resolvedValue.type == null) {
                        throw SemanticError(`Return Value type not resolved`, node)
                    }
                    if (resolvedValue.type != null) {
                        returnTypes.push(resolvedValue.type)
                    }
                    return skip
                }
            }
        })
        if (returnTypes.length > 1) {
            throw new Error(`TODO: Implement multiple return types`)
        }
        if (returnTypes.length === 0) {
            throw SemanticError(`Function returns no value`, func)
        }
        return { returnType: returnTypes[0] }
    },
    Reference(node, resolved, scopes) {
        let scope = scopes.get(node)
        let declaration = resolved.get(scope[node.name])
        return { type: declaration.type }
    },
    MemberExpression(node, resolved, scopes) {
        // this node should now have a type
        let objectType = getTypeExpressionOrClassDeclaration(node.object, resolved, scopes)
        let property = node.property
        // now we need to get a thing
        if (ast.ClassDeclaration.is(objectType) && ast.Id.is(property)) {
            let declaration = objectType.declarations.get(property.name)
            if (declaration == null) {
                throw SemanticError(`Member '${property.name}' not found on ${objectType.id.name}`, node)
            }
            if (declaration.type == null) {
                throw SemanticError(`Declaration not typed`, declaration)
            }
            return { type: declaration.type }
        }
        throw new Error("Not Implemented: getMemberType for " + objectType.constructor.name)
    },
    ArrayExpression(node) {
    },
    CallExpression(node) {
    },
    UnaryExpression(node) {
        return { type: node.argument.type }
    }
}

export default function inferTypes(root: Analysis) {
    let scopes = createScopeMaps(root)
    let resolved = new Map<ast.Typed,ast.Node>()
    let sorted = getSortedTypedNodes(root, scopes)
    function setResolved(originalNode, currentNode) {
        resolved.set(originalNode, currentNode)
        // make sure that you can still get the correct scope for the new node
        scopes.set(currentNode, scopes.get(originalNode))
    }
    for (let originalNode of sorted) {
        // first try to simplify
        let currentNode = resolved.get(originalNode) as Expression ?? originalNode
        currentNode = simplify(currentNode, resolved, scopes)
        setResolved(originalNode, currentNode)
        // then try to infer types
        if (currentNode.type == null) {
            let func = inferType[currentNode.constructor.name]
            let changes = func?.(currentNode, resolved, scopes)
            if (changes != null) {
                currentNode = currentNode.patch(changes)
            }
            setResolved(originalNode, currentNode)
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
