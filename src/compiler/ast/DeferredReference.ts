import { Expression } from "./Expression";
import * as kype from "@glas/kype";
import { SourceLocation } from "./SourceLocation";
import { Identifier } from "./Identifier";
import { Reference } from "./Reference";

//  not actually considered a reference until it's resolved.
export class DeferredReference extends Expression {

    public readonly id: Identifier;

    constructor(
        ref: Reference
    ) {
        super(ref.location);
        this.id = new Identifier(ref.location, ref.name);
    }

    public toKype(): kype.Expression {
        return new kype.DotExpression(this);
    }

    toString() {
        return `?${this.id.name}`;
    }

}

