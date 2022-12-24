import { Lookup } from "@glas/traverse";
import { AstNode } from "./ast/AstNode";
import { Declaration } from "./ast/Declaration";
import { Reference } from "./ast/Reference";
import { Scopes } from "./createScopes";

export class EvaluationContext {

    constructor(
        public readonly lookup: Lookup,
        public readonly scopes: Scopes
    ) {
    }

    getDeclaration(ref: Reference) {
        return this.getDeclarationFromName(ref, ref.name);
    }

    getDeclarationFromName(from: AstNode, name: string): Declaration {
        const scope = this.scopes.get(this.lookup.getOriginal(from));
        return scope[name];
    }

}