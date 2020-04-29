import Assembly from "../../ast/Assembly";
import { traverse, skip, remove, traverseChildren, replace } from "../../Traversal";
import { BinaryExpression, ConstrainedType, VariableDeclaration, Module, TypeDeclaration, ClassDeclaration, FunctionExpression, Parameter, BlockStatement, Declaration, ReturnStatement, FunctionType, MemberExpression, Node, UnionType, Reference, Scope, TemplateReference } from "../../ast";
import { mapValues, clone, getTypeCheckFunctionName } from "../../common";
import ImportDeclaration from "../../ast/ImportDeclaration";
import createScopeMap, { ScopeMap } from "../../createScopeMap";

const DO_NOT_EDIT_WARNING = `
This file was generated from ion source. Do not edit.
`

const typeMap = {
    Id: "Identifier",
    Reference: "Identifier"
}

const operatorMap = {
    "==": "===",
    "!=": "!==",
    "and": "&&",
    "or": "||",
}

function toRelativeModulePath(from: string, to: string) {
    let a = from.split('.')
    let b = to.split('.')
    while (a[0] === b[0]) {
        a.shift()
        b.shift()
    }
    let prefix = "./"
    let suffix = ""
    if (a.length == 2) {
        prefix = "../"
    }
    else if (a.length > 2) {
        prefix = "../"
        for (let i = 2; i < a.length; i++) {
            prefix = "../" + prefix
        }
    }

    return prefix + b.join("/") + suffix
}

function getIdentifier(parameter) {
    if (parameter.type === "Identifier") {
        return parameter
    }
    else {
        throw new Error("Not supported yet, maybe implement it: " + parameter.type)
    }
}

function getTypeReferenceName(node) {
    if (node.type === "Identifier") {
        return node.name
    }
    else if (node.type === "MemberExpression") {
        return node.property.name
    }
    else if (node.type === "BinaryExpression") {
        return getTypeReferenceName(node.left) + " " + node.operator + " " + getTypeReferenceName(node.right)
    }
    else {
        throw new Error("Expected Identifier or MemberExpression: " + node.type)
    }
}

function toRuntimeTypeCheck(node, value) {
    function call(callee) {
        return { type: "CallExpression", callee, arguments: [ value ] }
    }
    
    if (node.type === "Identifier") {
        return call({
            type: "Identifier",
            name: "is" + node.name
        })
    }
    else if (node.type === "MemberExpression") {
        return call({
            type: "MemberExpression",
            object: node.object,
            property: {
                type: "Identifier",
                name: "is" + node.property.name
            }
        })
    }
    else if (node.type === "BinaryExpression") {
        return {
            type: "BinaryExpression",
            left: toRuntimeTypeCheck(node.left, value),
            operator: node.operator == "|" ? "||" : "&&",
            right: toRuntimeTypeCheck(node.right, value)
        }
    }
    else {
        throw new Error("Unrecognized node type for is : " + node.type)
    }
}

const reserved = new Set(["arguments", "new", "import", "export", "class"])

function renameIfReserved(name: string) {
    return reserved.has(name) ? "_" + name : name
}

//  Is my conversion to Typescript technique sound?
//  Pre-converting nodes is a bit problematic...
//  Perhaps I should convert top down instead of bottom up?
//  Types are gone otherwise, so I believe we HAVE to go from top down.
//  TODO: convert to top-down conversion to Typescript.

const toAstEnter = {
    default(node) {
    },
    Assembly(node) {
        return skip
    },
    ImportDeclaration(node: ImportDeclaration) {
        return skip
    },
}

const toAstLeave = {
    default(node) {
        let name = node.constructor.name
        let type = typeMap[name] || name
        let esnode = { type, ...node } as any
        if (BinaryExpression.is(node)) {
            esnode.type = "BinaryExpression"
            esnode.operator = operatorMap[node.operator] || node.operator
        }
        return esnode
    },
    Module(node: Module, ancestors: object[], path: string[]) {
        let lastName = path[path.length - 1].split('.').pop()
        return {
            type: "Program",
            leadingComments: [{
                value: DO_NOT_EDIT_WARNING
            }],
            body: [
                ...node.declarations.values(),
                // add a default export of declaration with same name as module
                {
                    type: "ExportDefaultDeclaration",
                    declaration: {
                        type: "Identifier",
                        name: lastName
                    }
                }
            ]
        }
    },
    BlockStatement(node: BlockStatement) {
        return {
            type: "BlockStatement",
            body: node.statements,
        }
    },
    ConstrainedType(node: ConstrainedType) {
        return node.baseType
    },
    Parameter(node: Parameter) {
        if (node.value) {
            return {
                type: "AssignmentPattern",
                left: node.id,
                right: node.value,
            }
        }
        else {
            return node.id
        }
    },
    ReturnStatement(node: ReturnStatement) {
        return {
            type: "ReturnStatement",
            argument: node.value
        }
    },
    MemberExpression(node: MemberExpression) {
        return {
            type: "MemberExpression",
            object: node.left,
            property: node.right,
        }
    },
    TemplateReference(node: TemplateReference) {
        let result = {
            ...node.baseType,
            genericArguments: node.arguments
        }
        return result
    },
    ClassDeclaration(node: ClassDeclaration, ancestors: Node[], path: string[], scopes: ScopeMap) {
        return replace(
            maybeExport(
                node,
                {
                    type: "ClassDeclaration",
                    id: node.id,
                    implements: node.baseClasses,
                    body: {
                        type: "ClassBody",
                        body: [
                            ...node.declarations.map((d: any) => {
                                let copy = clone(d)
                                copy.kind = "readonly"
                                for (let declaration of copy.declarations) {
                                    // we remove inits from initial declaration since they will be definitely assigned in the constructor
                                    delete declaration.init
                                }
                                return copy
                            }),
                            {
                                type: "MethodDefinition",
                                kind: "constructor",
                                key: { type: "Identifier", name: "constructor" },
                                value: {
                                    type: "FunctionExpression",
                                    params: !node.isStructure ? (() => {
                                        // we need to use the ObjectPattern
                                        return  [{
                                            type: "ObjectPattern",
                                            properties: node.declarations.map((d: any) => {
                                                let declaration = d.declarations[0]
                                                let name = declaration.id.name
                                                let localName = renameIfReserved(name)
                                                return {
                                                    type: "Property",
                                                    kind: "init",
                                                    shorthand: name === localName,
                                                    key: { type: "Identifier", name },
                                                    value: declaration.init ? {
                                                        type: "AssignmentPattern",
                                                        left: { type: "Identifier", name: localName },
                                                        right: declaration.init
                                                    }
                                                    : { type: "Identifier", name: localName },
                                                }
                                            }),
                                            tstype: {
                                                type: "ObjectExpression",
                                                properties: node.declarations.map((d: any) => {
                                                    let declaration = d.declarations[0]
                                                    let required = declaration.init == null
                                                    let name = declaration.id.name
                                                    return {
                                                        type: "Property",
                                                        kind: "init",
                                                        key: { type: "Identifier", name: required ? name : `${name}?` },
                                                        value: declaration.tstype,
                                                    }
                                                })
                                            }
                                        }]
                                    })() : node.declarations.map((d: any) => {
                                        let declaration = d.declarations[0]
                                        let parameter: any = {
                                            type: "Identifier",
                                            name: declaration.id.name,
                                            tstype: declaration.tstype
                                        }
                                        if (declaration.init) {
                                            parameter = {
                                                type: "AssignmentPattern",
                                                left: parameter,
                                                right: declaration.init
                                            }
                                        }
                                        return parameter
                                    }),
                                    body: {
                                        type: "BlockStatement",
                                        body: [
                                            ...node.declarations.filter((d: any) => {
                                                let type = d.declarations[0].tstype
                                                if (type?.name) {
                                                    let scope = scopes.get(node)
                                                    let referencedDeclation = scope[type.name]
                                                    if (Parameter.is(referencedDeclation)) {
                                                        // we cannot runtime type check generic parameters
                                                        return false
                                                    }
                                                }
                                                return type != null
                                            }).map((d: any) => {
                                                let declarator = d.declarations[0]
                                                let name = declarator.id.name
                                                let localName = renameIfReserved(name)
                                                return {
                                                    type: "IfStatement",
                                                    test: {
                                                        type: "UnaryExpression",
                                                        operator: "!",
                                                        prefix: true,
                                                        argument: toRuntimeTypeCheck(
                                                            declarator.tstype,
                                                            { type: "Identifier", name: localName }
                                                        )
                                                    },
                                                    consequent: {
                                                        type: "ThrowStatement",
                                                        argument: {
                                                            type: "NewExpression",
                                                            callee: { type: "Identifier", name: "Error" },
                                                            arguments: [{
                                                                type: "BinaryExpression",
                                                                left: {
                                                                    type: "Literal",
                                                                    value: `${name} is not a ${getTypeReferenceName(declarator.tstype)}: `
                                                                },
                                                                operator: "+",
                                                                right: {
                                                                    type: "CallExpression",
                                                                    callee: {
                                                                        type: "MemberExpression",
                                                                        object: { type: "Identifier", name: "Class" },
                                                                        property: { type: "Identifier", name: "toString" }
                                                                    },
                                                                    arguments: [
                                                                        { type: "Identifier", name: localName }
                                                                    ]
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }),
                                            ...node.declarations.map((d: any) => {
                                                let name = d.declarations[0].id.name
                                                let localName = renameIfReserved(name)
                                                return {
                                                    type: "ExpressionStatement",
                                                    expression: {
                                                        type: "AssignmentExpression",
                                                        left: {
                                                            type: "MemberExpression",
                                                            object: { type: "ThisExpression" },
                                                            property: { type: "Identifier", name: name }
                                                        },
                                                        operator: "=",
                                                        right: { type: "Identifier", name: localName }
                                                    }
                                                }
                                            }),
                                            // Object.freeze(this)
                                            {
                                                type: "ExpressionStatement",
                                                expression: {
                                                    type: "CallExpression",
                                                    callee: {
                                                        type: "MemberExpression",
                                                        object: { type: "Identifier", name: "Object" },
                                                        property: { type: "Identifier", name: "freeze" }
                                                    },
                                                    arguments: [ { type: "ThisExpression" } ]
                                                }
                                            }
                                        ]
                                    }
                                },
                            },
                            {
                                type: "MethodDefinition",
                                kind: "method",
                                static: true,
                                key: { type: "Identifier", name: "is" },
                                value: {
                                    type: "FunctionExpression",
                                    params: [ { type: "Identifier", name: "value" } ],
                                    body: {
                                        type: "BlockStatement",
                                        body: [
                                            {
                                                type: "ReturnStatement",
                                                argument: {
                                                    type: "CallExpression",
                                                    callee: { type: "Identifier", name: getTypeCheckFunctionName(node.id.name) },
                                                    arguments: [{ type: "Identifier", name: "value" }]
                                                }
                                            }
                                        ]
                                    },
                                    tstype: ({ type: "BinaryExpression", left: { type: "Identifier", name: "value" }, operator: "is", right: node.id })
                                }
                            }
                        ]
                    }
                }
            ),
            // set the Type.id property
            {
                type: "ExpressionStatement",
                expression: {
                    type: "AssignmentExpression",
                    left: {
                        type: "MemberExpression",
                        object: {
                            type: "Identifier",
                            name: node.id.name,
                        },
                        property: {
                            type: "Literal",
                            value: "id"
                        },
                        computed: true
                    },
                    operator: "=",
                    right: {
                        type: "Literal",
                        value: node.implements![0]
                    }
                }
            },
            // set the Type.implements property for runtime type checking.
            {
                type: "ExpressionStatement",
                expression: {
                    type: "AssignmentExpression",
                    left: {
                        type: "MemberExpression",
                        object: {
                            type: "Identifier",
                            name: node.id.name,
                        },
                        property: {
                            type: "Literal",
                            value: "implements"
                        },
                        computed: true
                    },
                    operator: "=",
                    right: {
                        type: "NewExpression",
                        callee: { type: "Identifier", name: "Set" },
                        arguments: [{                            
                            type: "ArrayExpression",
                            elements: node.implements?.map(value => ({ type: "Literal", value }))
                        }]
                    }
                }
            }
        )
    },
    FunctionExpression(node: FunctionExpression) {
        return {
            type: "FunctionExpression",
            id: node.id,
            params: node.parameters,
            tstype: node.typeGuard ? ({ type: "BinaryExpression", left: getIdentifier(node.parameters[0]), operator: "is", right: node.typeGuard }) : node.returnType,
            body: node.body,
        }
    },
    FunctionType(node: FunctionType) {
        return {
            type: "Identifier",
            value: "TodoFunctionType"
        }
    },
    ImportDeclaration(node: ImportDeclaration, ancestors: Node[], path: string[]) {
        let thisModuleName = path[1]
        return {
            type: "ImportDeclaration",
            specifiers: [
                {
                    type: "ImportNamespaceSpecifier",
                    local: {
                        type: "Identifier",
                        name: node.id.name
                    }
                }
            ],
            source: {
                type: "Literal",
                value: toRelativeModulePath(thisModuleName, node.from),
            }
        }
    },
    TypeDeclaration(node: VariableDeclaration, ancestors: Node[], path: string[], scopes: ScopeMap) {
        return toAstLeave.VariableDeclaration(node, ancestors, path, scopes, "type")
    },
    VariableDeclaration(node: VariableDeclaration, ancestors: Node[], path: string[], scope: ScopeMap, kind?: string) {
        let value = node.value as any
        if (value && value.type === "FunctionExpression" && value.id && node.id.name === value.id.name) {
            // simplify
            //  const foo = function foo() {}
            // into
            //  function foo() {}
            return maybeExport(node, { ...value, type: "FunctionDeclaration" })
        }

        return maybeExport(node, {
            type: "VariableDeclaration",
            kind: kind ?? (node.assignable ? "let" : "const"),
            declarations: [{
                type: "VariableDeclarator",
                id: node.id,
                tstype: node.type,
                init: node.value
            }]
        })
    },
}

function maybeExport(node: Declaration, typescriptAst) {
    if (Declaration.is(node) && node.export) {
        return {
            type: "ExportNamedDeclaration",
            declaration: typescriptAst,
        }
    }
    return typescriptAst
}

export default function toTypescriptAst(root: Assembly) {
    let scopes = createScopeMap(root)
    traverseChildren(root, {
        enter(node, ancestors, path) {
            return (toAstEnter[node.constructor.name] || toAstEnter.default)(node, ancestors, path, scopes)
        },
        leave(node, ancestors, path) {
            return (toAstLeave[node.constructor.name] || toAstLeave.default)(node, ancestors, path, scopes) || node
        }
    })
}
