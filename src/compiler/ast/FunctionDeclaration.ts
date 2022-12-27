import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { Declarator } from "./Declarator";
import { FunctionExpression } from "./FunctionExpression";
import { SourceLocation } from "./SourceLocation";

export class FunctionDeclaration extends AbstractValueDeclaration {

    public readonly values: FunctionExpression[];

    constructor(
        location: SourceLocation,
        id: Declarator,
        ...values: FunctionExpression[]
    ){
        super(location, id, null);
        this.values = values;
    }

    toString() {
        return `${this.toMetaString()}function ${this.id}${this.values.length === 1 ? this.values[0] : " " + this.toBlockString(this.values, "[", "]")}`;
    }

}