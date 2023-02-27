import { CallExpression } from "./CallExpression";
import { Declarator } from "./Declarator";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";
import { TypeInterface } from "./TypeExpression";

export interface RootDeclaration extends Declaration {
    absolutePath: string;
}

export function isRootDeclaration(value: unknown): value is RootDeclaration {
    return value instanceof Declaration && value.isRoot;
}

export abstract class Declaration extends Statement {

    //  Only set on root module declarations.
    public readonly absolutePath?: string;
    public readonly meta: CallExpression[] = []
    
    constructor(
        location: SourceLocation,
        public readonly id: Declarator,
        public readonly type?: TypeInterface
    ){
        super(location);
    }

    get isRoot() : boolean {
        return typeof this.absolutePath === "string";
    }

    toMetaString() {
        let metaStrings
            = (
                this.isRoot ? `// ${this.absolutePath}\n` : ``
            )
            + this.meta.map(m => `${m}\n`).join(``);
        return metaStrings;
    }
    
}