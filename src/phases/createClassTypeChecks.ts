// import Assembly from "../ast/Assembly";
// import { Options } from "../Compiler";
// import Analysis from "../ast/Analysis";
// import { Node, ClassDeclaration, Reference, Id, VariableDeclaration, FunctionExpression, BlockStatement, Parameter, CallExpression, Literal, ReturnStatement, MemberExpression } from "../ast";
// import { SemanticError, clone, getUniqueClientName, getTypeCheckFunctionName } from "../common";

// export default function createClassTypeChecks(root: Analysis, options: Options) {

//     for (let name in root.declarations) {
//         let declaration = root.declarations[name]
//         if (ClassDeclaration.is(declaration)) {
//             let isTypeName = getTypeCheckFunctionName(name)
//             // add a private variable holding the implementations.
//             root.declarations[isTypeName] = new VariableDeclaration({
//                 location: clone(declaration.location),
//                 id: new Id({ name: isTypeName }),
//                 export: declaration.export,
//                 value: new FunctionExpression({
//                     typeGuard: new Reference({ name: name }),
//                     parameters: [new Parameter({
//                         id: new Id({ name: "value" })
//                     })],
//                     body: new BlockStatement({
//                         statements: [
//                             new ReturnStatement({
//                                 value: new CallExpression({
//                                     callee: new Reference({ name: "ion.Class:isInstance" }),
//                                     arguments: [
//                                         new Reference({ name: name }),
//                                         new Reference({ name: "value" })
//                                     ]
//                                 })
//                             })
//                         ]
//                     })
//                 }),
//                 assignable: false,
//             })
//         }
//     }

// }