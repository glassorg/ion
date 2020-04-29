// import { traverse, remove, skip, enter, leave, Visitor } from "./Traversal"
// import { SemanticError } from "./common"
// import { Declaration, Id, Scope, Reference, FunctionExpression, TypeDeclaration } from "./ast";

// export type ScopeMap = {
//     get(node: any) : any
// }

// /**
//  * Returns a Map which will contain a scope object with variable names returning Declarations.
//  * @param root the ast
//  */
// export default function createScopeMap(root, { checkDeclareBeforeUse=false } = {}): ScopeMap {
//     let map = new Map()
//     let scopes: object[] = []

//     function declare(node: Declaration, id: Id = node.id) {
//         let scope: any = scopes[scopes.length - 1]
//         scope[id.name as any] = node
//     }

//     traverse(root, {
//         enter(node) {
//             //  get the current scope
//             let scope = scopes[scopes.length - 1]
//             //  save a map from this nodes location to it's scope
//             map.set(node, scope)
//             //  if this node is a scope then we push a new scope
//             if (Scope.is(node)) {
//                 // console.log('++++')
//                 scopes.push(scope = { __proto__: scope })
//             }

//             //  let's check that referenced identifiers are in scope
//             if (checkDeclareBeforeUse && Reference.is(node)) {
//                 let declaration = scope[node.name]
//                 if (declaration == null) {
//                     throw SemanticError(`Cannot use variable '${node.name}' before declaration.`, node.location)
//                 }
//             }

//             //  declarations set themselves in scope
//             if (Declaration.is(node)) {
//                 declare(node)
//             }

//             //  functions set their parameters in scope
//             if (FunctionExpression.is(node)) {
//                 for (let parameter of node.parameters) {
//                     declare(parameter)
//                 }
//             }
//         },
//         leave(node) {
//             if (Scope.is(node)) {
//                 // console.log('----')
//                 scopes.pop()
//             }
//         }
//     })

//     return map
// }