import { CallExpression } from "./CallExpression";
import { Declarator } from "./Declarator";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";
import { Type } from "./Type";

export interface RootDeclaration extends Declaration {
    absolutePath: string;
}

export function isRootDeclaration(value: unknown): value is RootDeclaration {
    return value instanceof Declaration && value.isRoot;
}

export abstract class Declaration extends Statement {

    //  Only set on root module declarations.
    public readonly absolutePath?: string;
    
    constructor(
        location: SourceLocation,
        public readonly id: Declarator,
        public readonly type?: Type,
        public readonly meta: CallExpression[] = []        
    ){
        super(location);
    }

    get isRoot() : boolean {
        return typeof this.absolutePath === "string";
    }

    getMetaCallsByName(name: string) {
        return this.meta.filter(call => call.callee instanceof Reference && call.callee.name === name);
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