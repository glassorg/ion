import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";
import { TypeReference } from "./TypeReference";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { joinExpressions } from "./AstFunctions";
import { CoreTypes } from "../common/CoreType";

export class TypeConstraint extends Expression implements Type {

    constructor(
        location: SourceLocation,
        public readonly baseType: TypeReference,
        public readonly constraints: Expression[] = [],
    ) {
        super(location);
    }

    get isType(): true { return true }

    public toKype() {
        const constraints = [...this.constraints];
        if (this.baseType.name !== CoreTypes.Any) {
            constraints.push(
                new ComparisonExpression(this.baseType.location, new DotExpression(this.baseType.location), "is", this.baseType)
            )
        }
        return joinExpressions("&&", constraints).toKype();
    }

    toString() {
        return `${this.baseType}{${this.constraints}}`;
    }
}
