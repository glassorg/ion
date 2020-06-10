// import Assembly from "../ast/Assembly";
// import { traverse } from "../Traversal";
// import { SemanticError } from "../common";
// import TypeDeclaration from "../ast/TypeDeclaration";
// import ClassDeclaration from "../ast/ClassDeclaration";
// import VariableDeclaration from "../ast/VariableDeclaration";

// function isUpperCase(char: string) {
//     return char === char.toUpperCase()
// }

// function isLowerCase(char: string) {
//     return char === char.toLowerCase()
// }

// export default function semanticValidation(root: Assembly) {
//     return traverse(root, {
//         enter(node) {
//             if (TypeDeclaration.is(node) || ClassDeclaration.is(node)) {
//                 if (!isUpperCase(node.id.name[0])) {
//                     throw SemanticError("Types must be uppercase", node.id)
//                 }
//             }
//             else if (VariableDeclaration.is(node)) {
//                 if (!isLowerCase(node.id.name[0])) {
//                     throw SemanticError("Variables must be lowercase", node.id)
//                 }
//             }
//         }
//     })
// }