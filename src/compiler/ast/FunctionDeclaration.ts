import { nativeFunctionReturnTypes } from "../analysis/nativeFunctionReturnTypes";
import { AstNode } from "./AstNode";
import { ConstantDeclaration } from "./ConstantDeclaration";
import { Declarator } from "./Declarator";
import { FunctionExpression } from "./FunctionExpression";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";

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

    getReturnType(argumentTypes: TypeExpression[]): TypeExpression {
        const name = `${this.id}(${this.value.parameterTypes.map(p => p?.toUserTypeString()).join(",")})`;
        const nativeFunctionReturnType = nativeFunctionReturnTypes[name];
        if (nativeFunctionReturnType) {
            const result = nativeFunctionReturnType(...argumentTypes);
            console.log(`FunctionDeclaration.getReturnType: ${name} \n    ${argumentTypes.join("\n    ")}\n    =>\n    ${result}`);
            return result;
        }

        return this.value.getReturnType(argumentTypes);
    }

    toString() {
        return `${this.toMetaString()}function ${this.id}${this.value}`;
    }

}