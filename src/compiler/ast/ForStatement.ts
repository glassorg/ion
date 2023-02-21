import { BlockStatement } from "./BlockStatement";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { ForVariantDeclaration } from "./ForVariantDeclaration";
import { ScopeNode } from "./ScopeNode";
import { SourceLocation } from "./SourceLocation";
import { Statement } from "./Statement";

export class ForStatement extends Statement implements ScopeNode {

    constructor(
        location: SourceLocation,
        public readonly left: ForVariantDeclaration,
        public readonly right: Expression,
        public readonly body: BlockStatement,
    ){
        super(location);
    }

    get isScope(): true {
        return true;
    }

    toString() {
        return `for ${this.left} in ${this.right} ${this.body}`
    }

}