import { CallExpression } from "./CallExpression";
import { Declarator } from "./Declarator";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";
import { TypeExpression } from "./TypeExpression";

export interface ParsedDeclaration extends Declaration {
    absolutePath: string;
}

export interface AnalyzedDeclaration extends ParsedDeclaration {
    externals: string[];
}

export type AnalyzedDeclarationMap = Record<string,AnalyzedDeclaration>;

export interface ResolvedDeclaration extends AnalyzedDeclaration {
    resolved: true;
}

export type MaybeResolvedDeclaration = AnalyzedDeclaration | ResolvedDeclaration;

export function isRootDeclaration(value: unknown): value is ParsedDeclaration {
    return value instanceof Declaration && value.isRoot;
}

export abstract class Declaration extends Statement {

    //  Only set on root module declarations.
    public readonly absolutePath?: string;
    //  Only set on root module declarations.
    public readonly externals?: string[];
 
    public readonly meta: CallExpression[] = []
    public readonly declaredType?: TypeExpression;

    constructor(
        location: SourceLocation,
        public readonly id: Declarator,
    ){
        super(location);
    }

    get isRoot() : boolean {
        return typeof this.absolutePath === "string";
    }

    toMetaString() {
        return this.meta.map(m => `${m}\n`).join(``);
    }

}