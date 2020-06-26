import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { SemanticError } from "../common";
import TypeDeclaration from "../ast/TypeDeclaration";
import ClassDeclaration from "../ast/ClassDeclaration";
import VariableDeclaration from "../ast/VariableDeclaration";
import { TypeDefinition, Expression, Reference, Id, BlockStatement, Parameter, ReturnStatement, DotExpression, ExpressionStatement } from "../ast";

function isUpperCase(char: string) {
    return char === char.toUpperCase()
}

function isLowerCase(char: string) {
    return char === char.toLowerCase()
}

// const typeCheckTemplate = new TypeFunction({
//     parameters: [new Parameter({ id: new Id({ name: "." })})],
//     body: new BlockStatement({
//         statements: []
//     })
// })

// function convertToTypeFunction(expression: Expression) {
//     return typeCheckTemplate.patch({
//         body: new BlockStatement({
//             statements: [
//                 new ExpressionStatement({
//                     value: traverse(expression, {
//                         leave(node) {
//                             if (DotExpression.is(node)) {
//                                 return new Reference({ name: typeCheckTemplate.parameters[0].id.name, location: node.location })
//                             }
//                         }
//                     })
//                 })
//             ]
//         })
//     })
// }

export default function semanticValidation(root: Assembly) {
    return traverse(root, {
        enter(node) {
            if (TypeDeclaration.is(node)) {
                if (!isUpperCase(node.id.name[0])) {
                    throw SemanticError("Types must be uppercase", node.id)
                }
            }
            else if (VariableDeclaration.is(node)) {
                if (!isLowerCase(node.id.name[0])) {
                    throw SemanticError("Variables must be lowercase", node.id)
                }
            }
            if (TypeDefinition.is(node)) {
                return skip
            }
        },
        leave(node) {
            // if (TypeDefinition.is(node)) {
            //     return convertToTypeFunction(node.expression)
            // }
            if (DotExpression.is(node)) {
                throw SemanticError(`Dot Expression is only valid within Type Definitions`, node)
            }
        }
    })
}