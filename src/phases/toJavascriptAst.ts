import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { BinaryExpression, ExternalReference, ConstrainedType } from "../ast";
// import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration, ObjectLiteral, KeyValuePair, FunctionExpression, Parameter, BlockStatement, ReturnStatement } from "../ast";
// import TypeExpression from "../ast/TypeExpression";

const typeMap = {
    Id: "Identifier",
    Reference: "Identifier",
    TypeReference: "Identifier",
    ExternalReference: "Identifier",
}

const toAst = {
    default(node) {
        let esnode = { ...node } as any
        let name = node.constructor.name
        esnode.type = typeMap[name] || name
        return esnode
    },
    // ConstrainedType(node: ConstrainedType) {
    //     return node.constraint
    // },
    ExternalReference(node: ExternalReference) {
        return { poo: node.name }
    }
}

export default function toJavascriptAst(root: Assembly) {
    traverse(root, {
        leave(node) {
            return (toAst[node.constructor.name] || toAst.default)(node)
        }
    })
    return root
}
