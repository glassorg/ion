import { CallExpression } from "./CallExpression";
import { ConstantDeclaration } from "./ConstantDeclaration";
import { Declarator } from "./Declarator";
import { FunctionExpression } from "./FunctionExpression";
import { SourceLocation } from "./SourceLocation";

export class FunctionDeclaration extends ConstantDeclaration {

    declare readonly value: FunctionExpression;

    constructor(
        location: SourceLocation,
        id: Declarator,
        value: FunctionExpression,
    ){
        super(location, id, value.patch({ id }));
    }

    toString(user?: boolean) {
        return `${this.toMetaString()}function ${this.id} = ${this.value.toString(user)}`;
    }

}