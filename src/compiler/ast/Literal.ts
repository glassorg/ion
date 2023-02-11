import { CoreType } from "../common/CoreType";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { SemanticError } from "../SemanticError";

export abstract class Literal<T> extends Expression {

    constructor(
        location: SourceLocation,
        public readonly value: T,
    ){
        super(location);
    }

    abstract get coreType(): CoreType

    public toKype(): kype.Expression {
        if (typeof this.value === "string") {
            return new kype.StringLiteral(this.value);
        }
        if (typeof this.value === "number" || typeof this.value === "bigint") {
            return new kype.NumberLiteral(this.value);
        }
        throw new SemanticError(`Expected number literal`, this);
    }

    toString(): string {
        throw new Error("implement in subclasses");
    }

}