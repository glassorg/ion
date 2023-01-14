// import { RootDeclaration } from "../ast/Declaration";
// import { FunctionDeclaration } from "../ast/FunctionDeclaration";
// import { joinPath } from "../common/pathFunctions";
// import { SemanticError } from "../SemanticError";

// export function mergeAllDeclarations(moduleDeclarations: RootDeclaration[][]): RootDeclaration[] {
//     const map = new Map<string, RootDeclaration | RootDeclaration[]>();
//     for (const declarations of moduleDeclarations) {
//         for (const declaration of declarations) {
//             let previous = map.get(declaration.absolutePath);
//             if (previous) {
//                 if (!Array.isArray(previous)) {
//                     if (!(previous instanceof FunctionDeclaration) || !(declaration instanceof FunctionDeclaration)) {
//                         throw new SemanticError(`Only function declaration names can be overloaded`, previous.id, declaration.id);
//                     }
//                 }
//                 if (!Array.isArray(previous)) {
//                     map.set(declaration.absolutePath, previous = [previous]);
//                 }
//                 previous.push(declaration);
//             }
//             else {
//                 map.set(declaration.absolutePath, declaration);
//             }
//         }
//     }

//     //  also convert function declaration id's to the global namespace?

//     //  now we have a map of declarations or arrays.
//     //  we must iterate and replace any arrays with uniquely named values.
//     //  ok, now we really do need to rename the things.
//     return [...map.values()].map(value => {
//         if (Array.isArray(value)) {
//             return value.map((item, index) => item.patch({ absolutePath: joinPath(item.absolutePath, String(index + 1))}));
//         }
//         else {
//             return value;
//         }
//     }).flat(2);
// }