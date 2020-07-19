import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import Analysis from "../ast/Analysis";
import Expression from "../ast/Expression";
import Literal from "../ast/Literal";
import * as ast from "../ast";
import { Node } from "../ast";
import createScopeMaps, { ScopeMap, ScopeMaps } from "../createScopeMaps";
import getSortedTypedNodes, { getAncestorDeclaration } from "../analysis/getSortedTypedNodes";
import evaluate from "./evaluate";
import { getAbsoluteName, SemanticError, getLast, getLastIndex, isAbsoluteName, isTypeReference } from "../common";
import toCodeString from "../toCodeString";
// import simplifyTypeExpression from "../analysis/simplifyType";
import combineTypeExpression from "../analysis/combineTypeExpression";
import IdGenerator from "../IdGenerator";
import negateExpression from "../analysis/negate";
import simplify from "../analysis/simplify";
import { isTypeExpression } from "../ast/TypeExpression";
import * as types from "../types"
import getMemberTypeExpression from "../analysis/getMemberTypeExpression";

const literalTypes = {
    boolean: types.Boolean,
    number: types.Number,
    object: types.Object,
    string: types.String,
}

// function getMemberType(node: ast.MemberExpression, objectType: ast.TypeDefinition | ast.ClassDeclaration, member: String | ast.TypeDefinition): ast.Reference | ast.TypeDefinition {
//     if (ast.ClassDeclaration.is(objectType) && typeof member === "string") {
//         let declaration = objectType.declarations.get(member)
//         if (declaration == null) {
//             throw SemanticError(`Member '${member}' not found on ${objectType.id.name}`, node)
//         }
//         if (declaration.type == null) {
//             throw SemanticError(`Declaration not typed`, declaration)
//         }
//         return declaration.type
//     }
//     console.log({ objectType })
//     if (ast.TypeExpression.is(objectType)) {
//         return { type: ObjectRef }
//     }
//     // 
//     throw new Error("Not Implemented: getMemberType for " + objectType.constructor.name)
// }

function getDeclaration(node: ast.Reference, resolved: Resolved, scopes: ScopeMaps): ast.Declaration {
    node = resolved.get(node) ?? node
    let scope = scopes.get(node)
    let referencedNode = scope[node.name]
    if (ast.Declaration.is(referencedNode)) {
        return referencedNode
    }
    else if (ast.Reference.is(referencedNode)) {
        return getDeclaration(referencedNode, resolved, scopes)
    }
    else {
        console.error("Referenced node is not a declaration", referencedNode)
        throw new Error("Referenced node is not a declaration")
    }
}

function getTypeExpressionOrClassDeclaration(node: Expression, resolved: Resolved, scopes: ScopeMaps): ast.TypeDefinition | ast.ClassDeclaration {
    node = resolved.get(node) ?? node
    // always make sure we're using the latest node information
    if (node.type != null) {
        node = node.type
    }
    if (ast.TypeExpression.is(node)) {
        return node
    }
    if (ast.TypeDeclaration.is(node)) {
        return getTypeExpressionOrClassDeclaration(node.value, resolved, scopes)
    }
    if (ast.ClassDeclaration.is(node) || ast.TypeExpression.is(node)) {
        return node
    }
    if (ast.Typed.is(node)) {
        if (ast.Reference.is(node)) {
            let scope = scopes.get(node)
            let referencedNode = scope[node.name]
            // get the type of what's referenced.
            return getTypeExpressionOrClassDeclaration(referencedNode, resolved, scopes)
        }
        if (ast.Variable.is(node)) {
            if (node.type == null) {
                // console.log("....", node)
                throw SemanticError(`Variable type not resolved`, node)
            }
            return getTypeExpressionOrClassDeclaration(node.type, resolved, scopes)
        }
    }
    throw new Error(`Cannot find TypeExpression or ClassDeclaration: ${toCodeString(node)}`)
}

function createCombinedTypeExpression(type: ast.TypeDefinition | ast.Reference, name: String, knownTrueExpression: ast.Expression | null, location: ast.Location) {
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
    return simplify(new ast.TypeExpression({ location, value: combinedType }))

}

type Resolved = { get<T>(t: T): T }
const binaryOperationsType = {
    "<": types.Boolean,
    ">": types.Boolean,
    "<=": types.Boolean,
    ">=": types.Boolean,
    "==": types.Boolean,
    "!=": types.Boolean,
    "is": types.Boolean,
    "&": types.Boolean,
    "|": types.Boolean,
    "^": types.Number,
    "+": types.Number,
    "-": types.Number,
    "*": types.Number,
    "/": types.Number,
    "%": types.Number,
}

function is(type: ast.Reference | ast.TypeDefinition, left: Expression = new ast.DotExpression({})) {
    return new ast.BinaryExpression({
        location: type.location,
        left,
        operator: "is",
        right: type
    })
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
    ObjectExpression(node, resolved, scopeMap, ancestorsMap) {
        let value = new ast.BinaryExpression({
            left: new ast.DotExpression({}),
            operator: "is",
            right: types.Object
        })
        for (let p of node.properties) {
            if (p.key == null) {
                throw SemanticError("Key is required", p)
            }
            let pkey = resolved.get(p.key) ?? p.key
            let pvalue = resolved.get(p.value) ?? p.value
            console.log({ pkey, pvalue })
            value = new ast.BinaryExpression({
                left: value,
                operator: "&",
                right: new ast.BinaryExpression({
                    left: new ast.MemberExpression({ object: new ast.DotExpression({}), property: pkey }),
                    operator: "is",
                    right: pvalue.type!
                })
            })
        }
        let type = new ast.TypeExpression({ value })
        return { type }
    },
    ConditionalDeclaration(node, resolved, scopeMap, ancestorsMap) {
        const name = node.id.name
        let ancestors = ancestorsMap.get(node)!
        let containingIf = getLast(ancestors, ast.IfStatement.is)!
        let ancestorDeclaration = resolved.get(getAncestorDeclaration(node, scopeMap, ancestorsMap, ast.IfStatement.is))
        let assertion = containingIf.test
        if (node.negate) {
            assertion = negateExpression(assertion)
        }
        return { type: createCombinedTypeExpression(ancestorDeclaration.type!, name, assertion, node.location!) }
    },
    ClassDeclaration(node) {
        // calculate a TypeExpression that can be used to compare these instances
        let value: Expression = is(new ast.Reference(node.id))
        for (let base of node.baseClasses) {
            value = new ast.BinaryExpression({ left: value, operator: "&", right: is(base) })
        }
        for (let d of node.declarations.values()) {
            if (ast.VariableDeclaration.is(d) && d.assignable) {
                value = new ast.BinaryExpression({
                    left: value,
                    operator: "&",
                    right: is(d.type!, new ast.MemberExpression({ object: new ast.DotExpression({}), property: d.id }))
                })
            }
        }
        let instanceType = new ast.TypeExpression({ location: node.location, value })
        return { instanceType }
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
        let returnTypes: Array<ast.TypeDefinition | ast.Reference> = []
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
        let returnType!: ast.Reference | ast.TypeDefinition
        if (returnTypes.length > 1) {
            let value: ast.Expression | null = null
            for (let i = returnTypes.length - 1; i >= 0; i--) {
                let type = returnTypes[i]
                let newNode: Expression = ast.TypeExpression.is(type)
                    ? type.value
                    : new ast.BinaryExpression({ left: new ast.DotExpression({}), operator: "is", right: type, location: type.location})
                value = value != null ? new ast.BinaryExpression({ left: newNode, operator: "|", right: value }) : newNode
            }
            returnType = simplify(new ast.TypeExpression({ location: func.body.location, value: value! })) as any
        }
        else if (returnTypes.length === 0) {
            throw SemanticError(`Function returns no value`, func)
        }
        else if (returnTypes.length === 1) {
            returnType = returnTypes[0]
        }
        // we also need to infer the function signature type
        let type = func.type != null ? func.type : new ast.FunctionType({ parameters: func.parameters, returnType })
        return { returnType, type }
    },
    Reference(node, resolved, scopeMap, ancestorsMap) {
        if (isAbsoluteName(node.name) && isTypeReference(node)) {
            return null
        }
        let scope = scopeMap.get(node)
        let declaration = resolved.get(scope[node.name]) ?? scope[node.name]
        let type = declaration.type!
        // Infer in chained conditionals here.
        let ancestors = ancestorsMap.get(node)!
        // if we are the right side of a A & B conditional then that implies A
        type = getChainedConditionalTypeAssertion(ancestors, resolved, type, node, "&", false);
        // if we are the right side of a A | B optional then that implies not A
        type = getChainedConditionalTypeAssertion(ancestors, resolved, type, node, "|", true);
        return { type }
    },
    MemberExpression(node, resolved, scopes) {
        //  TODO: ClassDeclarations need a proper type, which includes static variables or we fix member ref
        // this node should now have a type
        let objectType = getTypeExpressionOrClassDeclaration(node.object, resolved, scopes)
        let property = resolved.get(node.property) ?? node.property
        // we need to get a class instance member
        if (ast.ClassDeclaration.is(objectType) && ast.Id.is(property)) {
            let declaration = objectType.declarations.get(property.name)
            if (declaration == null) {
                // console.log("11111 ObjectType", objectType, { property: property.name })
                throw SemanticError(`Member '${property.name}' not found on ${objectType.id.name}`, node)
            }
            if (declaration.type == null) {
                throw SemanticError(`Declaration not typed`, declaration)
            }
            return { type: declaration.type }
        }
        if (ast.TypeExpression.is(objectType)) {
            let type = getMemberTypeExpression(objectType, property)
            // console.log(`>>>>>>>>>>>>>>>>>`, toCodeString(type))
            return { type }
        }
        throw SemanticError("Not Implemented: getMemberType for " + objectType.constructor.name, node)
    },
    ArrayExpression(node) {
        // Type of ArrayExpression
        // For now... just Array reference?
        // we would need to find the common base type of multiple type expressions or references.
    },
    CallExpression(node, resolved, scopeMap) {
        // IF the callee references a ClassDeclaration,
        if (ast.Reference.is(node.callee)) {
            let declaration = getDeclaration(node.callee, resolved, scopeMap)
            if (ast.ClassDeclaration.is(declaration)) {
                return { type: node.callee }
            }
            if (ast.VariableDeclaration.is(declaration) && ast.FunctionExpression.is(declaration.value)) {
                let func = resolved.get(declaration.value) ?? declaration.value
                return { type: func.returnType }
            }
        }
        else {
            let callee = resolved.get(node.callee) ?? node.callee
            let calleeType = callee.type
            if (!ast.FunctionType.is(calleeType)) {
                throw SemanticError("Function expected", node.callee)
            }
            return { type: calleeType.returnType }
        }
    },
    UnaryExpression(node) {
        return { type: node.argument.type }
    }
}

const typesFile = "ion.types"
const typeProperties = ["type", "returnType"]

function getChainedConditionalTypeAssertion(ancestors: any[], resolved: Resolved, type: ast.TypeDefinition | ast.Reference, node: ast.Reference, operator: string, negate: boolean) {
    let binaryExpressionIndex = getLastIndex(ancestors, node => ast.BinaryExpression.is(node) && node.operator === operator);
    if (binaryExpressionIndex >= 0) {
        let parent = ancestors[binaryExpressionIndex] as ast.BinaryExpression;
        parent = resolved.get(parent) ?? parent;
        if (parent.operator === operator) {
            //  check if we are the right side.
            //  the parent expression cannot have been resolved yet so we don't have to use resolved.
            if (parent.right === (ancestors[binaryExpressionIndex + 1] ?? node)) {
                // OK, now we just have to check the left side and find a reference with same name.
                // we can then definitely assert that the left expression is true
                let assertion = parent.left
                if (negate) {
                    assertion = negateExpression(assertion)
                }
                let result = createCombinedTypeExpression(type, node.name, assertion, node.location!) as any;
                // console.log({
                //     type: toCodeString(type),
                //     parentLeft: toCodeString(parent.left),
                //     result: toCodeString(result)
                // })
                type = result
            }
        }
    }
    return type;
}

const emptyLocation = new ast.Location({ start: new ast.Position(0, 0), end: new ast.Position(0, 0), filename: "inferType.empty" })

export default function inferTypes(root: Analysis) {
    let identifiers = new Set<string>()
    let ancestorsMap = new Map<Node, Array<any>>()
    let scopes = createScopeMaps(root, { ancestorsMap, identifiers })
    let resolved = new Map<ast.Typed,ast.Node>()
    let sorted = getSortedTypedNodes(root, scopes, ancestorsMap)
    let idGenerator = new IdGenerator(identifiers)
    let newTypeDeclarations = new Map<string, ast.TypeDeclaration>()
    let typeNameToIdentifierName = new Map<string,string>()
    function getSharedTypeReference(node: ast.TypeDefinition) {
        let name = toCodeString(node)
        let absoluteName = typeNameToIdentifierName.get(name)
        if (absoluteName == null) {
            let localName = name // idGenerator.createNewIdName(name)
            absoluteName = getAbsoluteName(typesFile, localName)
            typeNameToIdentifierName.set(name, absoluteName)
            let declaration = new ast.TypeDeclaration({
                location: emptyLocation.patch({ filename: typesFile }),
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
            try {
                let changes = func?.(currentNode, resolved, scopes, ancestorsMap)
                if (changes != null) {
                    currentNode = currentNode.patch(changes)
                }
            }
            catch (e) {
                debugger
                func?.(currentNode, resolved, scopes, ancestorsMap)
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
                    if (ast.TypeDefinition.is(value)) {
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
