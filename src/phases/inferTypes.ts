import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import Analysis from "../ast/Analysis";
import Expression from "../ast/Expression";
import Literal from "../ast/Literal";
import * as ast from "../ast";
import { Node } from "../ast";
import createScopeMaps, { ScopeMap, ScopeMaps } from "../createScopeMaps";
import getSortedTypedNodes, { getAncestorDeclaration } from "./getSortedTypedNodes";
import evaluate from "./evaluate";
import { getAbsoluteName, SemanticError, getLast, getLastIndex, isAbsoluteName } from "../common";
import toCodeString from "../toCodeString";
import simplifyTypeExpression from "../analysis/simplifyTypeExpression";
import combineTypeExpression from "../analysis/combineTypeExpression";
import IdGenerator from "../IdGenerator";

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
    // always make sure we're using the latest node information
    node = resolved.get(node) ?? node
    if (ast.TypeDeclaration.is(node)) {
        return getTypeExpressionOrClassDeclaration(node.value, resolved, scopes)
    }
    if (ast.ClassDeclaration.is(node) || ast.TypeExpression.is(node)) {
        return node
    }
    if (ast.Variable.is(node)) {
        if (node.type == null) {
            // console.log("....", node)
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

function createCombinedTypeExpression(type: ast.TypeExpression | ast.Reference, name: String, knownTrueExpression: ast.Expression | null, location: ast.Location) {
    // let ancestorDeclaration = resolved.get(getAncestorDeclaration(node, scopeMap, ancestorsMap, ast.IfStatement.is))
    // now we convert the node assert to a type expression (by replacing variable name references to DotExpressions) so we can combine it.
    let found = 0
    let assertType = knownTrueExpression == null ? null :traverse(knownTrueExpression, {
        leave(node) {
            if (ast.Reference.is(node) && node.name === name) {
                found++
                return new ast.DotExpression({})
            }
        }
    })
    // didn't find any means the expression was irrelevant to the type so we can ignore it
    if (found === 0) {
        return type
    }
    let combinedType = combineTypeExpression(type, assertType)!
    return simplifyTypeExpression(new ast.TypeExpression({ location, value: combinedType }))

}

type Resolved = { get<T>(t: T): T }
const Boolean = new ast.Reference({ name: "ion.Boolean:Boolean" })
const Number = new ast.Reference({ name: "ion.Boolean:Number" })
const binaryOperationsType = {
    "<": Boolean,
    ">": Boolean,
    "<=": Boolean,
    ">=": Boolean,
    "==": Boolean,
    "!=": Boolean,
    "is": Boolean,
    "&": Boolean,
    "|": Boolean,
    "^": Number,
    "+": Number,
    "-": Number,
    "*": Number,
    "/": Number,
    "%": Number,
}

// that is some typescript kung fu right there.
export const inferType: { [P in keyof typeof ast]?: (node: InstanceType<typeof ast[P]>, resolved: Resolved, scopeMap: ScopeMaps, ancestorsMap: Map<Node, Array<any>>) => any} = {
    BinaryExpression(node, resolved) {
        // for now just use the left type
        let type = binaryOperationsType[node.operator]
        if (type == null) {
            throw SemanticError(`Could not find type for operator: ${node.operator}`, node)
        }
        return { type }
    },
    Literal(node) {
        let jstypeof = typeof node.value
        let type = literalTypes[jstypeof]
        if (type == null) {
            throw SemanticError(`Cannot find type ${jstypeof}`, type)
        }
        return { type }
    },
    ConditionalDeclaration(node, resolved, scopeMap, ancestorsMap) {
        const name = node.id.name
        let ancestors = ancestorsMap.get(node)!
        let containingIf = getLast(ancestors, ast.IfStatement.is)!
        let ancestorDeclaration = resolved.get(getAncestorDeclaration(node, scopeMap, ancestorsMap, ast.IfStatement.is))
        return { type: createCombinedTypeExpression(ancestorDeclaration.type!, name, containingIf.test, node.location!) }
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
        let returnType!: ast.Reference | ast.TypeExpression
        if (returnTypes.length > 1) {
            let value: ast.Expression | null = null
            for (let i = returnTypes.length - 1; i >= 0; i--) {
                let type = returnTypes[i]
                let newNode: Expression = ast.TypeExpression.is(type)
                    ? type.value
                    : new ast.BinaryExpression({ left: new ast.DotExpression({}), operator: "is", right: type, location: type.location})
                value = value != null ? new ast.BinaryExpression({ left: newNode, operator: "|", right: value }) : newNode
            }
            returnType = simplifyTypeExpression(new ast.TypeExpression({ location: func.body.location, value: value! }))
        }
        else if (returnTypes.length === 0) {
            throw SemanticError(`Function returns no value`, func)
        }
        else if (returnTypes.length === 1) {
            returnType = returnTypes[0]
        }
        return { returnType }
    },
    Reference(node, resolved, scopeMap, ancestorsMap) {
        if (isAbsoluteName(node.name)) {
            return null
        }
        let scope = scopeMap.get(node)
        let declaration = resolved.get(scope[node.name]) ?? scope[node.name]
        let type = declaration.type!
        // TODO: Infer in chained conditionals here.
        let ancestors = ancestorsMap.get(node)!
        let binaryExpressionIndex = getLastIndex(ancestors, node => ast.BinaryExpression.is(node) && node.operator === "&", ancestors.length - 1)
        if (binaryExpressionIndex >= 0) {
            let parent = ancestors[binaryExpressionIndex] as ast.BinaryExpression
            parent = resolved.get(parent) ?? parent
            if (parent.operator === "&") {
                //  check if we are the right side.
                //  the parent expression cannot have been resolved yet so we don't have to use resolved.
                if (parent.right === ancestors[binaryExpressionIndex + 1]) {
                    // OK, now we just have to check the left side and find a reference with same name.
                    // we can then definitely assert that the left expression is true
                    let result  = createCombinedTypeExpression(type, node.name, parent.left, node.location!)
                    console.log({
                        type: toCodeString(type),
                        parentLeft: toCodeString(parent.left),
                        result: toCodeString(result)
                    })
                    type = result
                }
            }
        }
        return { type }
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
        // console.log(objectType)
        console.log(`>>>>>>>>>>>>>>>>>`, toCodeString(objectType))
        throw SemanticError("Not Implemented: getMemberType for " + objectType.constructor.name, node)
    },
    ArrayExpression(node) {
    },
    CallExpression(node) {
    },
    UnaryExpression(node) {
        return { type: node.argument.type }
    }
}

const typesFile = "foo.types"
const typeProperties = ["type", "returnType"]

export default function inferTypes(root: Analysis) {
    let identifiers = new Set<string>()
    let ancestorsMap = new Map<Node, Array<any>>()
    let scopes = createScopeMaps(root, { ancestorsMap, identifiers })
    let resolved = new Map<ast.Typed,ast.Node>()
    let sorted = getSortedTypedNodes(root, scopes, ancestorsMap)
    let idGenerator = new IdGenerator(identifiers)
    let newTypeDeclarations = new Map<string, ast.TypeDeclaration>()
    let typeNameToIdentifierName = new Map<string,string>()
    function getSharedTypeReference(node: ast.TypeExpression) {
        let name = toCodeString(node)
        let absoluteName = typeNameToIdentifierName.get(name)
        if (absoluteName == null) {
            let localName = name // idGenerator.createNewIdName(name)
            absoluteName = getAbsoluteName(typesFile, localName)
            typeNameToIdentifierName.set(name, absoluteName)
            let declaration = new ast.TypeDeclaration({
                location: node.location!.patch({ filename:  typesFile }),
                id: new ast.Id({ location: node.location, name: absoluteName }),
                value: node,
                export: true,
            })
            newTypeDeclarations.set(absoluteName, declaration)
        }
        return new ast.Reference({ location: node.location, name: absoluteName })
    }
    function setResolved(originalNode, currentNode) {
        resolved.set(originalNode, currentNode)
        // make sure that you can still get the correct scope for the new node
        scopes.set(currentNode, scopes.get(originalNode))
        // same for ancestors map
        ancestorsMap.set(currentNode, ancestorsMap.get(originalNode)!)
    }
    for (let originalNode of sorted) {
        // first try to simplify
        let currentNode = resolved.get(originalNode) as Expression ?? originalNode
        currentNode = evaluate(currentNode, resolved, scopes)
        setResolved(originalNode, currentNode)
        // then try to infer types
        if (currentNode.type == null) {
            let func = inferType[currentNode.constructor.name]
            let changes = func?.(currentNode, resolved, scopes, ancestorsMap)
            if (changes != null) {
                //  convert TypeExpressions to shared references.
                for (let name in changes) {
                    let value = changes[name]
                    if (ast.TypeExpression.is(value)) {
                        // changes[name] = getSharedTypeReference(value)
                    }
                }
                currentNode = currentNode.patch(changes)
            }
            setResolved(originalNode, currentNode)
        }
    }

    root = traverse(root, {
        merge(node, changes, helper) {
            let result = resolved.get(node)
            if (result) {
                for (let name of typeProperties) {
                    let value = result[name]
                    if (ast.TypeExpression.is(value)) {
                        // move to a shared location and replace with a reference.
                        result = result!.patch({ [name]: getSharedTypeReference(value) })
                    }
                }
            }
            if (result) {
                return helper.patch(result, changes)
            }
        }
    })

    console.log(Array.from(newTypeDeclarations.keys()))

    // now return a new root with merged in new type declarations.
    return new Analysis({
        declarations: new Map([...root.declarations.entries(), ...newTypeDeclarations.entries()])
    })
}
