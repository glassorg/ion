import { Declaration, DeclarationPhase, AnalyzedDeclaration, ParsedDeclaration } from "../ast/Declaration";
import { VariableDeclaration } from "../ast/VariableDeclaration";
import { SemanticError } from "../SemanticError";

export async function semanticAnalysisSolo(declaration: ParsedDeclaration): Promise<AnalyzedDeclaration> {
    let errors: SemanticError[] = [];
    if (!(declaration instanceof Declaration)) {
        errors.push(new SemanticError(`Expected Declaration`, declaration));
    }
    if (declaration instanceof VariableDeclaration) {
        errors.push(new SemanticError(`Cannot declare variables in the module root. Did you mean to define a constant with 'let'?`, declaration));
    }
    if (errors.length > 0) {
        throw errors;
    }
    return declaration.patch({ phase: DeclarationPhase.analyzed });
}