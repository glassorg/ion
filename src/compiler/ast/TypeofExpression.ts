import { SourceLocation } from "./SourceLocation";
import { Type } from "./Type";
import { UnaryExpression } from "./UnaryExpression";
import { Reference } from "./Reference";
import { type EvaluationContext } from "../EvaluationContext";
import { type Expression } from "./Expression";
import { type Identifier } from "./Identifier";

export class TypeofExpression extends UnaryExpression implements Type {

    declare operator: "typeof";

    constructor(
        location: SourceLocation,
        argument: Reference,
    ) {
        super(location, "typeof", argument);
    }

    get isType(): true { return true }

    getMemberType(property: Identifier | Expression, c: EvaluationContext): Type | null {
        throw new Error(`Should never be called`);
    }

    public toKype() {
        const argumentType = this.argument.type;
        if (!argumentType) {
            console.log(this);
            throw new Error(`Expected this to be resolved for typeof`);
        }
        return this.argument.type!.toKype();
    }
}
