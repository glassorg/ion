import { Lookup } from "@glas/traverse";
import { AstNode } from "./ast/AstNode";
import { Declaration } from "./ast/Declaration";
import { Expression } from "./ast/Expression";
import { Reference } from "./ast/Reference";
import { VariableDeclaration, VariableKind } from "./ast/VariableDeclaration";
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

    getConstantValue(from: Reference): Expression {
        const declaration = this.getDeclaration(from);
        if (!(declaration instanceof VariableDeclaration && declaration.isConstant)) {
            throw new SemanticError(`Does not reference a constant ${from}`, from);
        }
        const value = declaration.value;
        if (!value) {
            throw new SemanticError(`Constant missing value`, declaration);
        }
        return value instanceof Reference ? this.getConstantValue(value) : value;
    }

    // getDeclarations(ref: Reference) {
    //     return this.getDeclarationsFromName(ref, ref.name);
    // }

    // getType(node: Resolvable) {
    //     if (!isResolved(node)) {
    //         throw new SemanticError(`Node is not resolved yet`, node);
    //     }
    //     node = this.lookup.getCurrent(node);
    //     return this.getReferencedType(node.type!);
    // }

    // private getReferencedType(type: Type): Type {
    //     if (isTypeof(type)) {
    //         const declaration = this.getSingleDeclaration(type.argument) as Resolved;
    //         return this.getType(declaration);
    //     }
    //     return type;
    // }

    // getFunctionTypes(callee: Expression, argTypes: TypeExpression[]): OldFunctionType | FunctionDeclaration[] {
    //     if (callee instanceof FunctionExpression) {
    //         return callee;
    //     }
    //     if (callee instanceof Reference) {
    //         const allFunctions = this.getDeclarations(callee);
    //         //  now we've found some functions, let's see which ones are potentially valid.
    //         //  we need kype-based type checking.
    //         const validFunctions = allFunctions?.filter(declaration => {
    //             if (!(declaration instanceof FunctionDeclaration)) {
    //                 throw new SemanticError(`Expected FunctionDeclaration`, declaration);
    //             }
    //             const func = declaration.value;
    //             return areValidArguments(func, argTypes) !== false;
    //         });
    //         return validFunctions as FunctionDeclaration[] ?? [];
    //     }
    //     throw new SemanticError(`Not a valid function`, callee);
    // }

}