// import createScopeMap from "../createScopeMap";
// import Assembly from "../ast/Assembly";
// import { traverse, setValue } from "../Traversal";
// import { Reference } from "../ast";
// import { SemanticError } from "../common";

// export default function checkReferences(root: Assembly) {
//     let scopes = createScopeMap(root)
//     traverse(root, {
//         enter(node) {
//             if (Reference.is(node)) {
//                 let scope = scopes.get(node)
//                 let declaration = scope[node.name]
//                 if (declaration == null) {
//                     console.log(`Reference not found: ${node.name}`)
//                     // throw SemanticError(`Reference not found: ${node.name}`, node)
//                 }
//             }
//         }
//     })
//     return root
// }
