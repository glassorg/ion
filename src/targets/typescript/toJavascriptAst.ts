import Assembly from "../../ast/Assembly";
import { traverse, skip, remove, traverseChildren } from "../../Traversal";
import { BinaryExpression, ConstrainedType, VariableDeclaration, Module, TypeDeclaration, ClassDeclaration, FunctionExpression, Parameter, BlockStatement, Declaration, ReturnStatement, FunctionType, MemberExpression, Node, UnionType, Reference } from "../../ast";
import { mapValues } from "../../common";
import ImportDeclaration from "../../ast/ImportDeclaration";

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

//  Is my conversion to Typescript technique sound?
//  Pre-converting nodes is a bit problematic...
//  Perhaps I should convert top down instead of bottom up?
//  Types are gone otherwise, so I believe we HAVE to go from top down.
//  TODO: convert to top-down conversion to Javascript.

const toAstEnter = {
    default(node) {
    },
    Assembly(node) {
        return skip
    },
    ImportDeclaration(node: ImportDeclaration) {
        return skip
    },
    // Module(node) {
    //     return skip
    // }
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
    Assembly(node: Assembly, ancestors, path) {
        traverseChildren(node, visitor, ancestors, path)
    },
    Module(node: Module) {
        return {
            type: "Program",
            body: Array.from(node.declarations.values())
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
    ClassDeclaration(node: ClassDeclaration) {
        return {
            type: "ClassDeclaration",
            id: node.id,
            body: {
                type: "ClassBody",
                body: [
                    ...node.declarations.map(d => ({ ...d, kind: "readonly" })),
                    {
                        type: "MethodDefinition",
                        kind: "constructor",
                        key: { type: "Identifier", name: "constructor" },
                        value: {
                            type: "FunctionExpression",
                            params: Array.from(node.declarations.values()).map((d: any) => {
                                return {
                                    type: "Identifier",
                                    name: d.declarations[0].id.name,
                                    tstype: d.declarations[0].tstype
                                }
                            }),
                            body: {
                                type: "BlockStatement",
                                body: [
                                    ...node.declarations.filter((d: any) => d.declarations[0].tstype).map((d: any) => {
                                        let declarator = d.declarations[0]
                                        return {
                                            type: "IfStatement",
                                            test: {
                                                type: "UnaryExpression",
                                                operator: "!",
                                                prefix: true,
                                                argument: {
                                                    type: "CallExpression",
                                                    callee: { type: "Identifier", name: `is${declarator.tstype.name}` },
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
                                                            value: `${declarator.id.name} is not a valid ${declarator.tstype.name}: `
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
                                    ...node.declarations.map((d: any) => {
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
                        }
                    }
                ]
            }
        }
    },
    FunctionExpression(node: FunctionExpression) {
        return {
            type: "FunctionExpression",
            id: node.id,
            params: node.parameters,
            tstype: node.returnType,
            body: node.body,
        }
    },
    FunctionType(node: FunctionType) {
        return {
            type: "Identifier",
            value: "TodoFunctionType"
        }
    },
    TypeDeclaration(node: VariableDeclaration, ancestors: Node[], path: string[]) {
        return { ...toAstLeave.VariableDeclaration(node, ancestors, path), kind: "type" }
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
    VariableDeclaration(node: VariableDeclaration, ancestors: Node[], path: string[]) {
        //  TODO: ImportDeclaration

        // check if value is External Reference
        // if (Reference.is(node.value) && node.value.isExternal()) {
        //     let ref = node.value
        //     let thisModuleName = path[1]
        //     let specifiers = [
        //         {
        //             type: "ImportSpecifier",
        //             imported: {
        //                 type: "Identifier",
        //                 name: ref.name,
        //             },
        //             local: node.id as any,
        //         }
        //     ]
        //     let isType = ref.name[0] === ref.name[0].toUpperCase()
        //     if (isType) {
        //         // then we must also import the is
        //         specifiers.push({
        //             type: "ImportSpecifier",
        //             imported: {
        //                 type: "Identifier",
        //                 name: `is${ref.name}`,
        //             },
        //             local: {
        //                 type: "Identifier",
        //                 name: `is${ref.name}`,
        //             },
        //         })
        //     }
        //     return {
        //         type: "ImportDeclaration",
        //         specifiers,
        //         source: {
        //             type: "Literal",
        //             value: toRelativeModulePath(thisModuleName, ref._file),
        //         }
        //     }
        // };

        let value = node.value as any
        if (value && value.type === "FunctionExpression" && node.id.name === value.id.name) {
            // simplify
            //  const foo = function foo() {}
            // into
            //  function foo() {}
            return { ...value, type: "FunctionDeclaration" }
        }

        return {
            type: "VariableDeclaration",
            kind: node.assignable ? "let" : "const",
            declarations: [{
                type: "VariableDeclarator",
                id: node.id,
                tstype: node.type,
                init: node.value
            }]
        };
    },
}

const visitor = {
    enter(node, ancestors, path) {
        return (toAstEnter[node.constructor.name] || toAstEnter.default)(node, ancestors, path)
    },
    leave(node, ancestors, path) {
        let newNode = (toAstLeave[node.constructor.name] || toAstLeave.default)(node, ancestors, path) || node
        if (Declaration.is(node) && node.export) {
            newNode = {
                type: "ExportNamedDeclaration",
                declaration: newNode,
            }
        }
        return newNode
    }
};

export default function toJavascriptAst(node: Node) {
    return traverse(node, visitor)
}
