import { AstNode } from "./AstNode";
import { ConstantDeclaration } from "./ConstantDeclaration";
import { Declarator } from "./Declarator";
import { FunctionExpression } from "./FunctionExpression";
import { SourceLocation } from "./SourceLocation";

export class FunctionDeclaration extends ConstantDeclaration {

    declare readonly value: FunctionExpression;

    constructor(
        location: SourceLocation,
        id: Declarator,
        value: FunctionExpression
    ){
        super(location, id, value);
    }

    // getReturnType(argumentTypes: TypeExpression[], callee: CallExpression): TypeExpression {
    //     const name = `${this.id}(${this.value.parameterTypes.map(p => p?.toString()).join(",")})`;
    //     const nativeFunctionReturnType = nativeFunctionReturnTypes[name];
    //     if (nativeFunctionReturnType) {
    //         const result = nativeFunctionReturnType(callee, ...argumentTypes);
    //         console.log(`FunctionDeclaration.getReturnType: ${name} \n    ${argumentTypes.join("\n    ")}\n    =>\n    ${result}`);
    //         return result;
    //     }
    //     return this.value.getReturnType(argumentTypes, callee);
    // }

    toString() {
        return `${this.toMetaString()}function ${this.id}${this.value}`;
    }

}