import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration, ObjectLiteral, KeyValuePair, FunctionExpression, Parameter, BlockStatement, ReturnStatement, DotExpression, CallExpression, MemberExpression, LiteralType, TypeReference } from "../ast";

export default function typeCreation(root: Assembly) {
    traverse(root, {
        enter(node) {
            if (TypeDeclaration.is(node)) {
                return skip
            }
        },
        leave(node) {
            if (TypeDeclaration.is(node) ) {
                return new VariableDeclaration({
                    id: node.id,
                    assignable: false,
                    export: node.export,
                    value: Reference.is(node.value) ? node.value : {
                        type: "ObjectExpression",
                        properties: [
                            {
                                type: "Property",
                                key: new Id({ name: "name" }),
                                value: new Literal({ value: node.id.name }),
                            },
                            {
                                type: "Property",
                                method: true,
                                key: new Id({ name: "is" }),
                                value: new FunctionExpression({
                                    parameters: [
                                        new Parameter({
                                            id: new Id({ name: "value" }),
                                        })
                                    ],
                                    body: new BlockStatement({
                                        statements: [
                                            new ReturnStatement({
                                                value: traverse(node.value, {
                                                    leave(node) {
                                                        if (LiteralType.is(node)) {
                                                            return new BinaryExpression({
                                                                left: new Reference({ name: "value" }),
                                                                operator: "==",
                                                                right: node.literal
                                                            })
                                                        }
                                                        if (UnionType.is(node)) {
                                                            return new BinaryExpression({
                                                                left: node.left,
                                                                operator: "||",
                                                                right: node.right
                                                            })
                                                        }
                                                        if (TypeReference.is(node)) {
                                                            return new CallExpression({
                                                                callee: new MemberExpression({
                                                                    object: new Reference({ name: node.name }),
                                                                    property: new Id({ name: "is" })
                                                                }),
                                                                arguments: [
                                                                    new Reference({ name: "value" })
                                                                ]
                                                            })
                                                        }
                                                        if (ConstrainedType.is(node)) {
                                                            return new BinaryExpression({
                                                                left: node.baseType,
                                                                operator: "&&",
                                                                right: node.constraint
                                                            })
                                                        }
                                                        if (DotExpression.is(node)) {
                                                            return new Reference({ name: "value" })
                                                        }
                                                    }
                                                })
                                            })
                                        ]
                                    })
                                })
                            }
                        ]
                    }
                })
            }
        }
    })
    return root
}
