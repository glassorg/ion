import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { SourceLocation } from "./SourceLocation";

export class MemberExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly object: Expression,
        public readonly property: Identifier,
    ){
        super(location);
    }

}