import { EvaluationContext } from "../EvaluationContext";
import { InfixOperator } from "../Operators";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";

export class CallExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly callee: Expression,
        public readonly args: Expression[],
    ){
        super(location);
    }

    public toKype(): kype.Expression {
        return new kype.CallExpresssion(this.callee.toKype(), this.args.map(arg => arg.toKype()));
    }

    toString(includeTypes = false) {
        return `${this.callee}(${this.args.join(", ")})${includeTypes ? this.toTypeString(this.type, "::") : ""}`;
    }

}