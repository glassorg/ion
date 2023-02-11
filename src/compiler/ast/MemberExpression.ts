import { EvaluationContext } from "../EvaluationContext";
import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";

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
        public readonly property: Identifier,
    ){
        super(location);
    }

    // protected *dependencies(c: EvaluationContext) {
    //     yield this.object;
    //     let declarations = c.getDeclarationsFromName(this.property, this.property.name);
    //     if (declarations) {
    //         yield* declarations.map(d => d.type);
    //     }
    //     else {
    //         // if declarations aren't found then this cannot be resolved yet.
    //         yield new Unresolvable(this.location);
    //     }
    // }

    public toKype(): kype.Expression {
        return new kype.MemberExpression(this.object.toKype(), new kype.Reference(this.property.name));
    }

    toString(includTypes = true) {
        return `${this.object}.${this.property}`;
    }

}