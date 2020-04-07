import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip, replace, pair } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration, ObjectLiteral, KeyValuePair, FunctionExpression, Parameter, BlockStatement, ReturnStatement, DotExpression, CallExpression, MemberExpression, LiteralType, TypeReference } from "../ast";
import { clone } from "../common";

function createRuntimeTypeCheckingFunctionDeclaration(node: TypeDeclaration) {
    // shit... need a deep clone function for this shit.
    //  as we need to traverse and modify the one but not the other.
    // !! TODO:
    const name = `is${node.id.name}`
    return new VariableDeclaration({
        id: new Id({ name }),
        assignable: false,
        export: node.export,
        value: new FunctionExpression({
            id: new Id({ name }),
            parameters: [
                new Parameter({
                    id: new Id({ name: "value" }),
                })
            ],
            returnType: new BinaryExpression({
                left: new Id({ name: "value" }),
                operator: "is",
                right: new Id({ name: node.id.name })
            }),
            body: new BlockStatement({
                statements: [
                    new ReturnStatement({
                        value: traverse(clone(node.value), {
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
                                        callee: new Reference({ name: `is${node.name}` }),
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
    })
}

export default function typeCreation(root: Assembly) {
    traverse(root, {
        enter(node) {
            if (TypeDeclaration.is(node)) {
                return skip
            }
        },
        leave(node, ancestors, path) {
            let name = path[path.length - 1]
            if (TypeDeclaration.is(node) ) {
                return replace(
                    pair(name, node),
                    pair(`is${name}`, createRuntimeTypeCheckingFunctionDeclaration(node))
                )
            }
        }
    })
    return root
}
