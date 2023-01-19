import { Immutable } from "./Immutable";
import { InfixOperator } from "../Operators";
import type { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { EvaluationContext } from "../EvaluationContext";

export class AstNode extends Immutable {

    public readonly resolved?: true;

    constructor(
        public readonly location: SourceLocation
    ) {
        super();
    }

    /**
     * returns the key used to get this nodes scope.
     */
    public get scopeKey() {
        if (this.location == null) {
            debugger;
        }
        return `${this.location.filename}:${this.location.startIndex}`;
    }

    protected *dependencies(c: EvaluationContext): Generator<AstNode> {
    }

    protected areAllDependenciesResolved(c: EvaluationContext) {
        for (const dep of this.dependencies(c)) {
            if (!dep.resolved) {
                return false;
            }
        }
        return true;
    }

    maybeResolve(c: EvaluationContext): AstNode | void {
        if (!this.resolved && this.areAllDependenciesResolved(c)) {
            return (this.resolve(c) ?? this).patch({ resolved: true });
        }
    }

    resolve(c: EvaluationContext): AstNode | void {
    }

    // THIS Expression reference is a problem we need to fix.
    split(operator: InfixOperator): Expression[] {
        let expressions: Expression[] = [];
        for (let expression of this.splitInternal(operator)) {
            expressions.push(expression);
        }
        return expressions;
    }

    *splitInternal(operator: InfixOperator): Generator<Expression> {
        yield this as unknown as Expression;
    }

    // toJSON() {
    //     let { location, ...rest } = super.toJSON();
    //     return { ...rest };
    // }

    toString() {
        return super.toString();
    }

    toBlockString(nodes: AstNode[], open = "{", close = "}", indent = '    ') {
        if (nodes == null || nodes.length === 0) {
            return `${open}${close}`;
        }
        return (`${open}\n${nodes.join(`\n`).split(`\n`).map(a => indent + a).join(`\n`)}\n${close}`);
    }

}