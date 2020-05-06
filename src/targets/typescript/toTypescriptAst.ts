import Assembly from "../../ast/Assembly";
import { traverse, skip, remove, traverseChildren, replace, Merge, Leave, Enter } from "../../Traversal";
import { getTypeCheckFunctionName, isTypeReference } from "../../common";
import ImportDeclaration from "../../ast/ImportDeclaration";
import BinaryExpression from "../../ast/BinaryExpression";
import Module from "../../ast/Module";
import BlockStatement from "../../ast/BlockStatement";
import ConstrainedType from "../../ast/ConstrainedType";
import Parameter from "../../ast/Parameter";
import ReturnStatement from "../../ast/ReturnStatement";
import ClassDeclaration from "../../ast/ClassDeclaration";
import FunctionExpression from "../../ast/FunctionExpression";
import FunctionType from "../../ast/FunctionType";
import VariableDeclaration from "../../ast/VariableDeclaration";
import Declaration from "../../ast/Declaration";
import Node from "../../ast/Node";
import Literal from "../../ast/Literal";
import TemplateReference from "../../ast/TemplateReference";
import CallExpression from "../../ast/CallExpression";
import Reference from "../../ast/Reference";
import ExpressionStatement from "../../ast/ExpressionStatement";
import TypeReference from "../../ast/TypeReference";
import UnionType from "../../ast/UnionType";

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
    else {
        throw new Error("Expected Identifier or MemberExpression: " + node.type)
    }
}

function toIsFunctionReference(node) {
    if (node.type === "Identifier") {
        return {
            type: "Identifier",
            name: "is" + node.name
        }
    }
    else if (node.type === "MemberExpression") {
        return {
            type: "MemberExpression",
            object: node.object,
            property: {
                type: "Identifier",
                name: "is" + node.property.name
            }
        }
    }
    else {
        throw new Error("Unrecognized node type for is : " + node.type)
    }
}

const toAstEnter: { [name: string]: Enter } = {
    default(node) {
    },
}

const toAstMerge: { [name: string]: Merge } = {
    default(node, changes, helper) {
        let name = node.constructor.name
        let type = typeMap[name] || name
        let esnode = { ...node, type } as any
        esnode = helper.patch(esnode, changes)
        if (BinaryExpression.is(node)) {
            esnode.type = "BinaryExpression",
            esnode.operator = operatorMap[node.operator] ?? node.operator
        }
        return esnode
    },
    Module(node: Module, changes: Partial<Module>) {
        return {
            type: "Program",
            leadingComments: [{
                value: DO_NOT_EDIT_WARNING
            }],
            body: changes.declarations ?? []
        }
    },
    TemplateReference(node: TemplateReference, changes: Partial<TemplateReference>) {
        let result = {
            ...changes.baseType,
            genericArguments: changes.arguments
        }
        return result
    },
    ExpressionStatement(node: ExpressionStatement, changes: Partial<ExpressionStatement>) {
        return {
            type: "ExpressionStatement",
            expression: changes.value!
        }
    },
    CallExpression(node: CallExpression, changes: Partial<CallExpression>) {
        const isConstructor = node.new || isTypeReference(node.callee)
        return {
            type: isConstructor ? "NewExpression" : "CallExpression",
            callee: changes.callee,
            arguments: changes.arguments
        }
    },
    ClassDeclaration(node: ClassDeclaration, changes: Partial<ClassDeclaration>) {
        return replace(
            maybeExport(
                node,
                {
                    type: "ClassDeclaration",
                    id: changes.id,
                    body: {
                        type: "ClassBody",
                        body: [
                            ...(changes.declarations ?? []).map((d: any) => {
                                return {
                                    ...d,
                                    kind: "readonly",
                                    declarations: d.declarations.map(dd => Object.assign(dd, { init: null }))
                                }
                            }),
                            {
                                type: "MethodDefinition",
                                kind: "constructor",
                                key: { type: "Identifier", name: "constructor" },
                                value: {
                                    type: "FunctionExpression",
                                    params: !node.isStructure ? (() => {
                                        // we need to use the ObjectPattern
                                        return  [
                                            {
                                                type: "ObjectPattern",
                                                properties: (changes.declarations ?? []).map((d: any) => {
                                                    let declaration = d.declarations[0]
                                                    let name = declaration.id.name
                                                    return {
                                                        type: "Property",
                                                        kind: "init",
                                                        shorthand: true,
                                                        key: { type: "Identifier", name },
                                                        value: declaration.init ? {
                                                            type: "AssignmentPattern",
                                                            left: { type: "Identifier", name },
                                                            right: declaration.init
                                                        }
                                                        : { type: "Identifier", name },
                                                    }
                                                }),
                                                tstype: {
                                                    type: "ObjectExpression",
                                                    properties: (changes.declarations ?? []).map((d: any) => {
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
                                            }
                                        ]
                                    })() : (changes.declarations ?? []).map((d: any) => {
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
                                            ...(changes.declarations ?? []).filter((d: any) => d.declarations[0].tstype).map((d: any) => {
                                                let declarator = d.declarations[0]
                                                return {
                                                    type: "IfStatement",
                                                    test: {
                                                        type: "UnaryExpression",
                                                        operator: "!",
                                                        prefix: true,
                                                        argument: {
                                                            type: "CallExpression",
                                                            callee: toIsFunctionReference(declarator.tstype),
                                                            arguments: [
                                                                { type: "Identifier", name: declarator.id.name }
                                                            ]
                                                        }
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
                                                                    value: `${declarator.id.name} is not a ${getTypeReferenceName(declarator.tstype)}: `
                                                                },
                                                                operator: "+",
                                                                right: {
                                                                    type: "Identifier",
                                                                    name: declarator.id.name
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }),
                                            ...(changes.declarations ?? []).map((d: any) => {
                                                return {
                                                    type: "ExpressionStatement",
                                                    expression: {
                                                        type: "AssignmentExpression",
                                                        left: {
                                                            type: "MemberExpression",
                                                            object: { type: "ThisExpression" },
                                                            property: { type: "Identifier", name: d.declarations[0].id.name }
                                                        },
                                                        operator: "=",
                                                        right: { type: "Identifier", name: d.declarations[0].id.name }
                                                    }
                                                }
                                            })
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
                                    tstype: ({ type: "BinaryExpression", left: { type: "Identifier", name: "value" }, operator: "is", right: changes.id })
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
                        value: node._implements[0]
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
                            elements: node._implements.map(value => ({ type: "Literal", value }))
                        }]
                    }
                }
            }
        )
    },
    BlockStatement(node: BlockStatement, changes: Partial<BlockStatement>) {
        return {
            type: "BlockStatement",
            body: changes.statements ?? [],
        }
    },
    ConstrainedType(node: ConstrainedType, changes: Partial<ConstrainedType>) {
        return changes.baseType
    },
    Parameter(node: Parameter, changes: Partial<Parameter>) {
        if (node.value) {
            return {
                type: "AssignmentPattern",
                left: changes.id,
                right: changes.value,
            }
        }
        else {
            return { ...changes.id, tstype: changes.type }
        }
    },
    ReturnStatement(node: ReturnStatement, changes: Partial<ReturnStatement>) {
        return {
            type: "ReturnStatement",
            argument: changes.value
        }
    },
    FunctionExpression(node: FunctionExpression, changes: Partial<FunctionExpression>) {
        return {
            type: "FunctionExpression",
            id: changes.id,
            params: changes.parameters,
            tstype: changes.typeGuard ? ({
                type: "BinaryExpression",
                left: getIdentifier(changes.parameters![0]),
                operator: "is",
                right: changes.typeGuard
            }) : changes.returnType,
            body: changes.body,
        }
    },
    FunctionType(node: FunctionType) {
        return {
            type: "Identifier",
            value: "TodoFunctionType"
        }
    },
    ImportDeclaration(node: ImportDeclaration, changes: Partial<ImportDeclaration>, helper, ancestors, path: string[]) {
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
    TypeDeclaration(node: VariableDeclaration, changes, helper, ancestors, path) {
        return (toAstMerge.VariableDeclaration as any)(node, changes, helper, ancestors, path, "type")
    },
    VariableDeclaration(node: VariableDeclaration, changes: Partial<VariableDeclaration>, helper, ancestors, path: string[], kind?: string) {
        let value = changes.value as any
        if (value && value.type === "FunctionExpression" && (value.id == null || node.id.name === value.id.name)) {
            // simplify
            //  const foo = function foo() {}
            // into
            //  function foo() {}
            return maybeExport(node, { ...value, id: { type: "Identifier", name: node.id.name }, type: "FunctionDeclaration" })
        }

        return maybeExport(node, {
            type: "VariableDeclaration",
            kind: kind ?? (node.assignable ? "let" : "const"),
            declarations: [{
                type: "VariableDeclarator",
                id: changes.id,
                tstype: changes.type,
                init: changes.value
            }]
        })
    },
}

function maybeExport(node: Declaration, ast) {
    if (Declaration.is(node) && node.export) {
        return {
            type: "ExportNamedDeclaration",
            declaration: ast,
        }
    }
    return ast
}

const visitor = {
    enter(node, ancestors, path) {
        return (toAstEnter[node.constructor.name] ?? toAstEnter.default)(node, ancestors, path)
    },
    merge(node, ancestors, path, values, helper) {
        return (toAstMerge[node.constructor.name] ?? toAstMerge.default)(node, ancestors, path, values, helper)
    },
};

export default function toTypescriptAst(node: Node) {
    return traverse(node, visitor)
}
