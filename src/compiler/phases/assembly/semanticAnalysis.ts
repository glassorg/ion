// import { Assembly } from "../ast/Assembly";
// import { traverseWithContext } from "../common/traverse";
// import { SemanticError } from "../SemanticError";

// export function semanticAnalysis(assembly: Assembly): Assembly {
//     let errors: SemanticError[] = [];
//     traverseWithContext(assembly, externals, c => ({
//         enter(node) {
//             if (node instanceof ConstantDeclaration && node.value instanceof Reference) {
//                 const declaration = c.getSingleDeclaration(node.value);
//                 if (declaration instanceof VariableDeclaration) {
//                     errors.push(new SemanticError(`Constant cannot be declared from a `, node.value, declaration.id));
//                 }
//             }
//         }
//     }));
//     if (errors.length > 0) {
//         throw errors;
//     }
//     return assembly;
// }

import { Assembly } from "../../ast/Assembly";
import { SemanticError } from "../../SemanticError";

export function semanticAnalysis(assembly: Assembly) {
    let errors: SemanticError[] = [];

    //  DO SOMETHING.
    // console.log("SemanticAnalysis", assembly);

    if (errors.length > 0) {
        throw errors;
    }
    return assembly;
}