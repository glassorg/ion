

// export async function getPossibleExternalReferences(declaration: RootDeclaration): Promise<string[]> {
//     let externals = new Set<string>();
//     // resolve externals.
//     let scopes = createScopes(declaration);
//     declaration = traverse(declaration, {
//         enter(node) {
//             if (node instanceof Reference) {
//                 let scope = scopes.get(node);
//                 let declaration = scope[node.name];
//                 if (!declaration) {
//                     externals.add(node.name);
//                 }
//             }
//         }
//     })
//     const result = [...externals].sort().map(external => getPossiblePaths(declaration.absolutePath, external)).flat();
//     return result;
// }