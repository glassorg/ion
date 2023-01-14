import { AstNode } from "./AstNode";
import { ConstantDeclaration } from "./ConstantDeclaration";
import { Declarator } from "./Declarator";
import { FunctionExpression } from "./FunctionExpression";
import { SourceLocation } from "./SourceLocation";

export function isGloballyScoped(node: AstNode) {
    return node instanceof FunctionDeclaration;
}

export class FunctionDeclaration extends ConstantDeclaration {

    declare readonly value: FunctionExpression;

    constructor(
        location: SourceLocation,
        id: Declarator,
        value: FunctionExpression
    ){
        super(location, id, value);
    }

    toString() {
        return `${this.toMetaString()}function ${this.id}${this.value}`;
    }

}