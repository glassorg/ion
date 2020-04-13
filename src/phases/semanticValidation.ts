import Input from "../ast/Input";
import { traverse } from "../Traversal";
import { TypeDeclaration, VariableDeclaration, ClassDeclaration, Module } from "../ast";
import { SemanticError } from "../common";

function isUpperCase(char: string) {
    return char === char.toUpperCase()
}

function isLowerCase(char: string) {
    return char === char.toLowerCase()
}

export default function semanticValidation(root: Input) {
    return traverse(root, {
        enter(node) {
            if (TypeDeclaration.is(node) || ClassDeclaration.is(node)) {
                if (!isUpperCase(node.id.name[0])) {
                    throw SemanticError("Types must be uppercase", node.id)
                }
            }
            else if (VariableDeclaration.is(node)) {
                if (!isLowerCase(node.id.name[0])) {
                    throw SemanticError("Variables must be lowercase", node.id)
                }
            }
        }
    })
}