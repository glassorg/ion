import { Lookup } from "@glas/traverse";
import { AstNode } from "./ast/AstNode";
import { Declaration } from "./ast/Declaration";
import { Expression, isResolved, Resolvable, Resolved } from "./ast/Expression";
import { FunctionDeclaration } from "./ast/FunctionDeclaration";
import { FunctionExpression } from "./ast/FunctionExpression";
import { areValidArguments, FunctionType } from "./ast/FunctionType";
import { Reference } from "./ast/Reference";
import { TypeExpression } from "./ast/TypeExpression";
import { isTypeof, UnaryExpression } from "./ast/UnaryExpression";
import { Scopes } from "./createScopes";
import { SemanticError } from "./SemanticError";

export class EvaluationContext {

    constructor(
        public readonly lookup: Lookup,
        public readonly scopes: Scopes
    ) {
    }

    getSingleDeclaration(ref: Reference) {
        return this.getSingleDeclarationFromName(ref, ref.name);
    }

    getSingleDeclarationFromName(from: AstNode, name: string): Declaration {
        const declarations = this.getDeclarationsFromName(from, name);
        if (declarations?.length !== 1) {
            throw new SemanticError(`Expected a single declaration`, ...(declarations ?? []));
        }
        return declarations[0];
    }

    getDeclarations(ref: Reference) {
        return this.getDeclarationsFromName(ref, ref.name);
    }

    getDeclarationsFromName(from: AstNode, name: string): Declaration[] {
        const scope = this.scopes.get(this.lookup.getOriginal(from)) ?? this.scopes.get(null);
        return scope[name];
    }

    getType(node: Resolvable) {
        if (!isResolved(node)) {
            throw new SemanticError(`Node is not resolved yet`, node);
        }
        node = this.lookup.getCurrent(node);
        return this.getReferencedType(node.resolvedType!);
    }

    private getReferencedType(type: TypeExpression): TypeExpression {
        if (isTypeof(type)) {
            const declaration = this.getSingleDeclaration(type.argument) as Resolved;
            return this.getType(declaration);
        }
        return type;
    }

    getFunctionTypes(callee: Expression, argTypes: TypeExpression[]): FunctionType | FunctionDeclaration[] {
        if (callee instanceof FunctionExpression) {
            return callee;
        }
        if (callee instanceof Reference) {
            const allFunctions = this.getDeclarations(callee);
            //  now we've found some functions, let's see which ones are potentially valid.
            //  we need kype-based type checking.
            const validFunctions = allFunctions.filter(declaration => {
                if (!(declaration instanceof FunctionDeclaration)) {
                    throw new SemanticError(`Expected FunctionDeclaration`, declaration);
                }
                const func = declaration.value;
                return areValidArguments(func, argTypes) !== false;
            }) as FunctionDeclaration[];
            return validFunctions;
        }
        throw new SemanticError(`Not a valid function`, callee);
    }

}