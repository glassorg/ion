import { EvaluationContext } from "../EvaluationContext";
import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { SourceLocation } from "./SourceLocation";

export class Unresolvable extends Expression {

    protected areAllDependenciesResolved(c: EvaluationContext): boolean {
        return false;
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

    protected *dependencies(c: EvaluationContext) {
        yield this.object;
        let declarations = c.getDeclarationsFromName(this.property, this.property.name);
        if (declarations) {
            yield* declarations;
        }
        else {
            // if declarations aren't found then this cannot be resolved yet.
            yield new Unresolvable(this.location);
        }
    }

    toString() {
        return `${this.object}.${this.property}`;
    }

}