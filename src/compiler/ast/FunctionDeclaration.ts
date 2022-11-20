import { ConstantDeclaration } from "./ConstantDeclaration";
import { Declarator } from "./Declarator";
import { FunctionExpression } from "./FunctionExpression";
import { SourceLocation } from "./SourceLocation";

export class FunctionDeclaration extends ConstantDeclaration {

    constructor(
        location: SourceLocation,
        id: Declarator,
        value: FunctionExpression,
    ){
        super(location, id, value);
    }

    toString() {
        return `function ${this.id}${this.value}`;
    }

}