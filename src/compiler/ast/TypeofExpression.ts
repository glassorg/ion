import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { joinExpressions } from "./AstFunctions";
import { UnaryExpression } from "./UnaryExpression";
import { Reference } from "./Reference";

export class TypeofExpression extends UnaryExpression implements Type {

    declare operator: "typeof";

    constructor(
        location: SourceLocation,
        argument: Reference,
    ) {
        super(location, "typeof", argument);
    }

    get isType(): true { return true }

    public toKype() {
        const argumentType = this.argument.type;
        if (!argumentType) {
            console.log(this);
            throw new Error(`Expected this to be resolved for typeof`);
        }
        return this.argument.type!.toKype();
    }
}
