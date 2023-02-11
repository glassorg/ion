import { AstNode } from "./AstNode";
import { TypeExpression } from "./TypeExpression";

export class Resolvable extends AstNode {

    public readonly resolved: boolean = false;

    /**
     * The resolved type or false if this is a type and therefore doesn't resolve further.
     */
    public readonly type?: TypeExpression;

    /**
     * Returns an empty string if not resolved or else " : Type"
     */
    toTypeString(type = this.type, colon = type?.resolved ? "::" : ":") {
        return type ? ` ${colon} ${type}` : ``;
    }
    
    toJSON() {
        let value = super.toJSON();
        if (value.resolved === false) {
            value.resolved = undefined;
        }
        return value;
    }

}
