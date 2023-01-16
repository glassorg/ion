import { AstNode } from "./AstNode";
import { TypeExpression } from "./TypeExpression";
import * as kype from "@glas/kype";

export interface Resolvable extends AstNode {
    readonly resolvedType?: TypeExpression;
}

export interface Resolved extends Resolvable {
    readonly resolvedType: TypeExpression;
}

export function isResolved(node: Resolvable): node is Resolved {
    return node.resolvedType !== undefined;
}

export class Expression extends AstNode implements Resolvable {

    /**
     * The resolved type or false if this is a type and therefore doesn't resolve further.
     */
    public readonly resolvedType?: TypeExpression;

    public toKypeType(): kype.TypeExpression {
        return new kype.TypeExpression(this.toKype());
    }

    public toKype(): kype.Expression {
        throw new Error("Not implemented yet");
    }

    /**
     * Returns an empty string if not resolved or else " : Type"
     */
    toTypeString(type = this.resolvedType, colon = ":") {
        return type ? ` ${colon} ${type}` : ``;
    }

    /**
     * Returns a user friendly type string that should be similar to language normal type syntax.
     */
    public toUserTypeString() {
        return this.toString();
    }

}
