import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration, ObjectLiteral, KeyValuePair, FunctionExpression, Parameter, BlockStatement, ReturnStatement, DotExpression, CallExpression, MemberExpression, LiteralType } from "../ast";

export default function typeCreation(root: Assembly) {
    traverse(root, {
        enter(node) {
            if (TypeDeclaration.is(node)) {
                return skip
            }
        },
        leave(node) {
            if (TypeDeclaration.is(node)) {
                return new VariableDeclaration({
                    id: node.id,
                    assignable: false,
                    value: new FunctionExpression({
                        id: new Id({ name: "is" }),
                        parameters: [
                            new Parameter({
                                id: new Id({ name: "value" }),
                            })
                        ],
                        body: new BlockStatement({
                            statements: [
                                new ReturnStatement({
                                    value: traverse(node, {
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
                                            if (ConstrainedType.is(node)) {
                                                return new BinaryExpression({
                                                    left: new CallExpression({
                                                        callee: new Reference({ name: node.baseType.name }),
                                                        arguments: [
                                                            new Reference({ name: "value" })
                                                        ]
                                                    }),
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
                })
            }
        }
    })
    return root
}
