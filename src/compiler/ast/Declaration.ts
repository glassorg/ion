import { CallExpression } from "./CallExpression";
import { Declarator } from "./Declarator";
import { Resolvable } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";
import { TypeExpression } from "./TypeExpression";

export interface RootDeclaration extends Declaration {
    absolutePath: string;
}

export function isRootDeclaration(value: unknown): value is RootDeclaration {
    return value instanceof Declaration && value.isRoot;
}

export abstract class Declaration extends Statement implements Resolvable {

    //  Only set on root module declarations.
    public readonly absolutePath?: string;
 
    public readonly meta: CallExpression[] = []
    // public readonly resolvedType?: TypeExpression;
    
    constructor(
        location: SourceLocation,
        public readonly id: Declarator,
        public readonly declaredType?: TypeExpression
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

    /**
     * Returns an empty string if not resolved or else " : Type"
     */
    toTypeString() {
        if (this.resolvedType) {
            return super.toTypeString(this.resolvedType, "::");
        }
        if (this.declaredType) {
            return super.toTypeString(this.declaredType, ":");
        }
        return ``
    }
    
}