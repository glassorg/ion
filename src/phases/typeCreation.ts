import Assembly from "../ast/Assembly";
import { traverse, skip, replace } from "../Traversal";
import { getTypeCheckFunctionName, SemanticError, isTypeReference } from "../common";
import VariableDeclaration from "../ast/VariableDeclaration";
import Id from "../ast/Id";
import FunctionExpression from "../ast/FunctionExpression";
import Parameter from "../ast/Parameter";
import Reference from "../ast/Reference";
import BlockStatement from "../ast/BlockStatement";
import ReturnStatement from "../ast/ReturnStatement";
import LiteralType from "../ast/LiteralType";
import BinaryExpression from "../ast/BinaryExpression";
import UnionType from "../ast/UnionType";
import CallExpression from "../ast/CallExpression";
import ConstrainedType from "../ast/ConstrainedType";
import DotExpression from "../ast/DotExpression";
import TypeDeclaration from "../ast/TypeDeclaration";
import TypeReference from "../ast/TypeReference";

function createRuntimeTypeCheckingFunctionDeclaration(name: string, node: TypeDeclaration, root: Assembly) {
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
            typeGuard: new TypeReference({ name: node.id.name }),
            body: new BlockStatement({
                statements: [
                    new ReturnStatement({
                        value: traverse(node.value!, {
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
    return traverse(root, {
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
            else if (BinaryExpression.is(node)) {
                // convert A is Foo type checks into calls to runtime function.
                if (node.operator === "is") {
                    if (!Reference.is(node.right)) {
                        throw SemanticError("Right side of type check must be a type reference", node.right)
                    }
                    let isName = getTypeCheckFunctionName(node.right.name)
                    return new CallExpression({
                        location: node.location,
                        callee: new Reference({ location: node.right.location, name: isName }),
                        arguments: [node.left]
                    })
                }
            }
        }
    })
}
