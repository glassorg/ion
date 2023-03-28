import { Lookup } from "@glas/traverse";
import { AstNode } from "./ast/AstNode";
import { Declaration } from "./ast/Declaration";
import { Expression } from "./ast/Expression";
import { Reference } from "./ast/Reference";
import { VariableDeclaration } from "./ast/VariableDeclaration";
import { globalScopeKey, Scopes } from "./createScopes";
import { SemanticError } from "./SemanticError";

export class EvaluationContext {

    constructor(
        public readonly lookup: Lookup,
        public readonly scopes: Scopes
    ) {
    }

    getDeclaration(from: Reference): Declaration
    getDeclaration(from: AstNode, name: string): Declaration
    getDeclaration(from: AstNode, name = (from as Reference).name): Declaration {
        const scope = this.scopes.get(from.scopeKey) ?? this.scopes.get(globalScopeKey);
        const declaration = scope[name];
        if (!declaration) {
            debugger;
            throw new SemanticError(`Declaration not found: ${name}`, from);
        }
        return declaration;
    }

    getOriginalDeclaration(from: Reference): Declaration {
        const declaration = this.getDeclaration(from);
        if (declaration instanceof VariableDeclaration) {
            const value = declaration.value;
            if (value instanceof Reference) {
                return this.getOriginalDeclaration(value);
            }
        }
        return declaration;
    }

    getConstantValue(from: Reference): Expression {
        const declaration = this.getOriginalDeclaration(from);
        if (!(declaration instanceof VariableDeclaration && declaration.isConstant)) {
            console.log(declaration);
            throw new SemanticError(`Does not reference a constant ${from}`, from);
        }
        const value = declaration.value;
        if (!value) {
            throw new SemanticError(`Constant missing value`, declaration);
        }
        return value;
    }

}