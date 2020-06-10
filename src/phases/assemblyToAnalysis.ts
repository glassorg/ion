// import Assembly from "../ast/Assembly";
// import { Options } from "../Compiler";
// import Analysis from "../ast/Analysis";
// import { getAbsoluteName } from "../common";
// import { traverse } from "../Traversal";
// import Declaration from "../ast/Declaration";

// export default function assemblyToAnalysis(root: Assembly, options: Options): Analysis {

//     //  Then we extract all declarations out
//     let declarations = new Map<string, Declaration>()
//     for (let moduleName of root.modules.keys()) {
//         let module = root.modules.get(moduleName)!
//         // move all declarations into the assembly declarations
//         for (let declaration of module.declarations) {
//             let exportName = getAbsoluteName(moduleName, declaration.id.name)
//             declarations.set(
//                 exportName,
//                 declaration.patch({
//                     id: declaration.id.patch({
//                         name: exportName
//                     })
//                 })
//             )
//         }
//     }

//     //  And finally create the new Analysis scope
//     return new Analysis({ declarations })
// }