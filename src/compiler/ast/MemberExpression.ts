import { EvaluationContext } from "../EvaluationContext";
import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { ExpressionKind } from "@glas/kype";

export class Unresolvable extends Expression {

    protected areAllDependenciesResolved(c: EvaluationContext): boolean {
        return false;
    }

    toString(includeTypes = true): string {
        return `!UNRESOLVABLE!`;
    }

}

export class MemberExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly object: Expression,
        public readonly property: Identifier | Expression,
    ){
        super(location);
    }

    get isPropertyResolved() {
        return this.property instanceof Identifier || this.property.resolved;
    }

    public toKype(): kype.Expression {
        return new kype.Reference(this.toString(), ExpressionKind.Unknown, this);
    }

    toString(includTypes = true) {
        return `${this.object}.${this.property}`;
    }

}