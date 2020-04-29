import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip, replace, pair } from "../Traversal";
import { isTypeReference, getLastName, getExternalModuleNameAndExportName, getAbsoluteName, getTypeCheckFunctionName } from "../common";
import VariableDeclaration from "../ast/VariableDeclaration";
import Id from "../ast/Id";
import FunctionExpression from "../ast/FunctionExpression";
import Parameter from "../ast/Parameter";
import Reference, { isReference } from "../ast/Reference";
import BlockStatement from "../ast/BlockStatement";
import ReturnStatement from "../ast/ReturnStatement";
import LiteralType from "../ast/LiteralType";
import BinaryExpression from "../ast/BinaryExpression";
import UnionType from "../ast/UnionType";
import CallExpression from "../ast/CallExpression";
import ConstrainedType from "../ast/ConstrainedType";
import DotExpression from "../ast/DotExpression";
import TypeDeclaration from "../ast/TypeDeclaration";
import TypeExpression from "../ast/TypeExpression";

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
                                if (ConstrainedType.is(node)) {
                                    return new BinaryExpression({
                                        left: new CallExpression({
                                            callee: new Reference({ name: getTypeCheckFunctionName(node.baseType.name), location: node.baseType.location }),
                                            arguments: [
                                                new Reference({ name: "value", location: node.baseType.location })
                                            ]
                                        }),
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
        }
    })
}
