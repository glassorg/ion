import { AstNode } from "./AstNode";
import { Type } from "./Type";

export class Resolvable extends AstNode {

    public readonly resolved: boolean = false;

    /**
     * The resolved type or false if this is a type and therefore doesn't resolve further.
     */
    public readonly type?: Type;

    /**
     * Returns an empty string if not resolved or else " : Type"
     */
    toTypeString(type = this.type, colon = this.resolved ? "::" : ":") {
        return type ? ` ${colon} ${type.toString()}` : ``;
    }
    
    toJSON() {
        let value = super.toJSON();
        if (value.resolved === false) {
            value.resolved = undefined;
        }
        return value;
    }

}
