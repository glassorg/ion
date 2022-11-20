import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { ParameterDeclaration } from "./ParameterDeclaration";
import { SourceLocation } from "./SourceLocation";

export class FunctionExpression extends Expression {

    constructor(
        location: SourceLocation,
        public readonly parameters: ParameterDeclaration[],
        public readonly body: BlockStatement,
    ) {
        super(location);
    }

    toString() {
        return `(${this.parameters.join(", ")}) => ${this.body}`;
    }

}