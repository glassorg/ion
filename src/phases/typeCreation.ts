import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip, replace, pair } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration, ObjectLiteral, KeyValuePair, FunctionExpression, Parameter, BlockStatement, ReturnStatement, DotExpression, CallExpression, MemberExpression, LiteralType } from "../ast";
import { clone, isTypeReference, getLastName, getExternalModuleNameAndExportName, getAbsoluteName, getTypeCheckFunctionName } from "../common";

function createRuntimeTypeCheckingFunctionDeclaration(name: string, node: TypeDeclaration, root: Assembly) {
    // shit... need a deep clone function for this shit.
    //  as we need to traverse and modify the one but not the other.
    // !! TODO:
    return new VariableDeclaration({
        location: node.location,
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
            // flag to indicate that this is a type guard.
            typeGuard: new Reference({ name: node.id.name }),
            // returnType: new BinaryExpression({
            //     left: new Reference({ name: "value" }),
            //     operator: "is",
            //     right: new Reference({ name: node.id.name })
            // }),
            body: new BlockStatement({
                statements: [
                    new ReturnStatement({
                        value: traverse(clone(node.value), {
                            leave(node) {
                                if (LiteralType.is(node)) {
                                    return new BinaryExpression({
                                        left: new Reference({ name: "value", location: node.location }),
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
                                if (isTypeReference(node)) {
                                    return new CallExpression({
                                        callee: new Reference({ name: getTypeCheckFunctionName(node.name), location: node.location }),
                                        arguments: [
                                            new Reference({ name: "value", location: node.location })
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
                                    return new Reference({ name: "value", location: node.location })
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
            if (TypeDeclaration.is(node)) {
                const name = node.id.name
                const isName = getTypeCheckFunctionName(name)
                return replace(
                    node,
                    createRuntimeTypeCheckingFunctionDeclaration(isName, node, root)
                )
            }
        }
    })
    return root
}
