import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration } from "../ast";
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
                node.rootTypeExpression = true
            }
        }
    })
    return root
}
