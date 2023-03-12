import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";

/**
 *  0 .. array.length
 *  0 .. 10
 */
export class RangeExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly start: Expression,
        public readonly finish: Expression,
        public readonly minExclusive = false,
        public readonly maxExclusive = false,
    ){
        super(location);
    }

    toString() {
        return `${this.start} .. ${this.finish}`;
    }

}