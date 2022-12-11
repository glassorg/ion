import { Declarator } from "./Declarator";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export interface ParsedDeclaration extends Declaration {
    absolutePath: string;
}

export interface AnalyzedDeclaration extends ParsedDeclaration {
    phase: DeclarationPhase.analyzed;
}

export interface CompiledDeclaration extends ParsedDeclaration {
    phase: DeclarationPhase.compiled;
}

export function isRootDeclaration(value: unknown): value is ParsedDeclaration {
    return value instanceof Declaration && value.isRoot;
}

export enum DeclarationPhase {
    analyzed,
    compiled,
}

export abstract class Declaration extends Statement {

    /**
     * Only set on root module declarations.
     */
    public readonly absolutePath?: string;
    /**
     * Only set on root module declarations.
     */
     public readonly phase?: DeclarationPhase;

    constructor(
        location: SourceLocation,
        public readonly id: Declarator
    ){
        super(location);
    }

    get isRoot() : boolean {
        return typeof this.absolutePath === "string";
    }

}