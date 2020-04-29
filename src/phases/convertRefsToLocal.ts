// import Assembly from "../ast/Assembly";
// import { Options } from "../Compiler";
// import Analysis from "../ast/Analysis";
// import { getAbsoluteName, getLocalName, getLastName, EXPORT_DELIMITER } from "../common";
// import { Declaration, Reference, Id } from "../ast";
// import createScopeMap from "../createScopeMap";
// import { traverse } from "../Traversal";

// export default function convertRefsToLocal(root: Assembly, options: Options) {
//     //  First we convert any refences to other declarations within the same module
//     //  into absolute references
//     for (let moduleName in root.modules) {
//         let module = root.modules[moduleName]
//         let prefix = moduleName + EXPORT_DELIMITER
//         // // now create a scope map
//         // let scopes = createScopeMap(module)
//         // // ALL inter declaration references must be converted to external references.
//         traverse(module, {
//             leave(node) {
//                 if (Id.is(node)) {
//                     let localName = getLocalName(node.name, moduleName)
//                     if (localName != null) {
//                         node.name = localName
//                     }
//                 }
//                 else if (Id.is(node)) {
//                     // any identifiers need to be shortened to their last name
//                     node.name = getLastName(node.name)
//                 }
//             }
//         })
//     }
// }