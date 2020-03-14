import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration, ObjectLiteral, KeyValuePair, FunctionExpression, Parameter, BlockStatement, ReturnStatement } from "../ast";
import TypeExpression from "../ast/TypeExpression";

export default function typeCreation(root: Assembly) {
    traverse(root, {
        enter(node) {
            if (TypeExpression.is(node)) {
                return skip
            }
        },
        leave(node) {
            if (TypeExpression.is(node)) {
                return new ObjectLiteral({
                    type: "Object",
                    elements: [
                        new KeyValuePair({
                            key: new Id({ name: "is" }),
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
                                            value: node
                                        })
                                    ]
                                })
                            })
                        })
                    ]
                })
            }
        }
    })
    return root
}
