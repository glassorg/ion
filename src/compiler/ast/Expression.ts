import { AstNode } from "./AstNode";
import { TypeExpression } from "./TypeExpression";
import * as kype from "@glas/kype";
import { EvaluationContext } from "../EvaluationContext";
import { SemanticError } from "../SemanticError";

export interface Resolvable extends AstNode {
    isResolvable: true;
    readonly resolvedType?: TypeExpression;
    readonly resolved: boolean;
}

export function isResolvable(node: any): node is Resolvable {
    const maybeResolvable = node as Resolvable;
    return maybeResolvable?.isResolvable;
}

export interface Resolved extends Resolvable {
    readonly resolvedType: TypeExpression;
}

export function isResolved(node: Resolvable): node is Resolved {
    return node.resolvedType !== undefined;
}

export abstract class Expression extends AstNode implements Resolvable {

    /**
     * The resolved type or false if this is a type and therefore doesn't resolve further.
     */
    public readonly resolvedType?: TypeExpression;

    get isResolvable(): true {
        return true;
    }

    protected *dependencies(c: EvaluationContext): Generator<Expression | undefined> {
    }

    protected areAllDependenciesResolved(c: EvaluationContext) {
        for (const dep of this.dependencies(c)) {
            if (dep && !dep.resolved) {
                return false;
            }
        }
        return true;
    }

    public get resolved() {
        return this.resolvedType != null;
    }

    public toKypeType(): kype.TypeExpression {
        return new kype.TypeExpression(this.toKype());
    }

    public toKype(): kype.Expression {
        throw new Error("Not implemented yet");
    }

    /**
     * Returns an empty string if not resolved or else " : Type"
     */
    toTypeString(type?: TypeExpression, colon = ":") {
        return type ? ` ${colon} ${type.toUserTypeString()}` : ``;
    }

    /**
     * Returns a user friendly type string that should be similar to language normal type syntax.
     */
    public toUserTypeString() {
        return this.toString();
    }

    /**
     * Returns a string without type information that can be used to compare
     */
    abstract toString(includeTypes?: boolean): string;

}
