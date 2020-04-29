// import Assembly from "../ast/Assembly";
// import { Options } from "../Compiler";
// import Analysis from "../ast/Analysis";
// import { Declaration, Module } from "../ast";

// export default function analysisToAssembly(root: Analysis, options: Options): Assembly {

//     let modules: { [name: string]: Module } = {}

//     for (let name in root.declarations) {
//         let declaration = root.declarations[name]
//         let moduleName = declaration.location!.filename
//         let module = modules[moduleName]
//         if (module == null) {
//             modules[moduleName] = module = new Module({ declarations: [] })
//         }
//         module.declarations.push(declaration)
//     }

//     return new Assembly({ modules })
// }