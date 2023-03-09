import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { ExpressionKind } from "@glas/kype";

export class CallExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly callee: Expression,
        public readonly args: Expression[],
    ){
        super(location);
    }

    public toKype(): kype.Expression {
        return new kype.Reference(this.toString(), ExpressionKind.Unknown, this);
    }

    toString(includeTypes = true) {
        return `${this.callee}(${this.args.join(", ")})${includeTypes ? this.toTypeString(this.type, "::") : ""}`;
    }

}