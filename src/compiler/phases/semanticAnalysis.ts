import { ConstantDeclaration } from "../ast/ConstantDeclaration";
import { AnalyzedDeclaration, ResolvedDeclaration } from "../ast/Declaration";
import { Reference } from "../ast/Reference";
import { VariableDeclaration } from "../ast/VariableDeclaration";
import { traverseWithContext } from "../common/traverse";
import { SemanticError } from "../SemanticError";

export function semanticAnalysis(declaration: AnalyzedDeclaration, externals: ResolvedDeclaration[]): AnalyzedDeclaration {
    let errors: SemanticError[] = [];
    traverseWithContext(declaration, externals, c => ({
        enter(node) {
            if (node instanceof ConstantDeclaration && node.value instanceof Reference) {
                const declaration = c.getSingleDeclaration(node.value);
                if (declaration instanceof VariableDeclaration) {
                    errors.push(new SemanticError(`Constant cannot be declared from a `, node.value, declaration.id));
                }
            }
        }
    }));
    if (errors.length > 0) {
        throw errors;
    }
    return declaration;
}