// import createScopeMap from "../createScopeMap";
// import Assembly from "../ast/Assembly";
// import { traverse, skip, replace, pair } from "../Traversal";
// import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration, ObjectLiteral, KeyValuePair, FunctionExpression, Parameter, BlockStatement, ReturnStatement, DotExpression, CallExpression, MemberExpression, LiteralType } from "../ast";
// import { clone } from "../common";

// function getTypeCheckFunctionName(name: string) {
//     // this could be an external file.path:Name
//     let colon = name.lastIndexOf(':')
//     if (colon > 0) {
//         return name.slice(0, colon + 1) + getTypeCheckFunctionName(name.slice(colon + 1))
//     }
//     else {
//         return `is${name}`
//     }
// }

// function createRuntimeTypeCheckingFunctionDeclaration(name: string, node: TypeDeclaration) {
//     // shit... need a deep clone function for this shit.
//     //  as we need to traverse and modify the one but not the other.
//     // !! TODO:
//     return new VariableDeclaration({
//         id: new Id({ name }),
//         assignable: false,
//         export: node.export,
//         value: new FunctionExpression({
//             id: new Id({ name }),
//             parameters: [
//                 new Parameter({
//                     id: new Id({ name: "value" }),
//                 })
//             ],
//             returnType: new BinaryExpression({
//                 left: new Id({ name: "value" }),
//                 operator: "is",
//                 right: new Id({ name: node.id.name })
//             }),
//             body: new BlockStatement({
//                 statements: [
//                     new ReturnStatement({
//                         value: traverse(clone(node.value), {
//                             leave(node) {
//                                 if (LiteralType.is(node)) {
//                                     return new BinaryExpression({
//                                         left: new Reference({ name: "value", location: node.location }),
//                                         operator: "==",
//                                         right: node.literal
//                                     })
//                                 }
//                                 if (UnionType.is(node)) {
//                                     return new BinaryExpression({
//                                         left: node.left,
//                                         operator: "||",
//                                         right: node.right
//                                     })
//                                 }
//                                 if (Reference.is(node) && node._isType) {
//                                     return new CallExpression({
//                                         callee: new Reference({ name: getTypeCheckFunctionName(node.name), location: node.location }),
//                                         arguments: [
//                                             new Reference({ name: "value", location: node.location })
//                                         ]
//                                     })
//                                 }
//                                 if (ConstrainedType.is(node)) {
//                                     return new BinaryExpression({
//                                         left: node.baseType,
//                                         operator: "&&",
//                                         right: node.constraint
//                                     })
//                                 }
//                                 if (DotExpression.is(node)) {
//                                     return new Reference({ name: "value", location: node.location })
//                                 }
//                             }
//                         })
//                     })
//                 ]
//             })
//         })
//     })
// }

// export default function typeCreation(root: Assembly) {
//     traverse(root, {
//         enter(node) {
//             if (TypeDeclaration.is(node)) {
//                 return skip
//             }
//         },
//         leave(node, ancestors, path) {
//             let name = path[path.length - 1]
//             if (TypeDeclaration.is(node) ) {
//                 const isName = getTypeCheckFunctionName(name)
//                 return replace(
//                     pair(name, node),
//                     pair(isName, createRuntimeTypeCheckingFunctionDeclaration(isName, node))
//                 )
//             }
//         }
//     })
//     return root
// }
