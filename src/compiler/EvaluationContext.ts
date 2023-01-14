import { Lookup } from "@glas/traverse";
import { AstNode } from "./ast/AstNode";
import { Declaration } from "./ast/Declaration";
import { Reference } from "./ast/Reference";
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
        const scope = this.scopes.get(this.lookup.getOriginal(from));
        return scope[name];
    }

}