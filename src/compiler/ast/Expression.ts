import { AstNode } from "./AstNode";
import { TypeExpression } from "./TypeExpression";

export class Expression extends AstNode {

    /**
     * The resolved type or false if this is a type and therefore doesn't resolve further.
     */
    public readonly resolvedType?: TypeExpression;

    /**
     * Returns an empty string if not resolved or else " : Type"
     */
    toTypeString(type = this.resolvedType, colon = ":") {
        return type ? ` ${colon} ${type}` : ``;
    }

}
