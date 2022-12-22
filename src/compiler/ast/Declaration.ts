import { CallExpression } from "./CallExpression";
import { Declarator } from "./Declarator";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export interface ParsedDeclaration extends Declaration {
    absolutePath: string;
}

export interface AnalyzedDeclaration extends ParsedDeclaration {
    externals: string[];
}

export interface CompiledDeclaration extends AnalyzedDeclaration {
    compiled: true;
}

export function isRootDeclaration(value: unknown): value is ParsedDeclaration {
    return value instanceof Declaration && value.isRoot;
}

export abstract class Declaration extends Statement {

    //  Only set on root module declarations.
    public readonly absolutePath?: string;
    //  Only set on root module declarations.
    public readonly externals?: string[];
    //  Only set on root module declarations.
    public readonly compiled?: boolean;

    public readonly meta: CallExpression[] = []

    constructor(
        location: SourceLocation,
        public readonly id: Declarator,
    ){
        super(location);
    }

    get isRoot() : boolean {
        return typeof this.absolutePath === "string";
    }

}