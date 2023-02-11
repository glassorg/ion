import { isSubTypeOf } from "../analysis/isSubType";
import { AstNode } from "./AstNode";
import { Expression } from "./Expression";
import { SourceLocation } from "./SourceLocation";
import { TypeExpression } from "./TypeExpression";
import { ParameterDeclaration } from "./VariableDeclaration";

export class FunctionType extends Expression {

    constructor(
        location: SourceLocation,
        public readonly parameterTypes: TypeExpression[],
        public readonly returnType: TypeExpression
    ) {
        super(location);
    }

    toString() {
        return `(${this.parameterTypes.join(",")}) => ${this.returnType}`;
    }
}

export interface OldFunctionType extends AstNode {

    readonly parameters: ParameterDeclaration[];
    getReturnType(argumentTypes: TypeExpression[], callee: Expression): TypeExpression;

}

export function areValidArguments(functionType: OldFunctionType, argTypes: TypeExpression[]): boolean | null {
    if (functionType.parameters.length !== argTypes.length) {
        return false;
    }
    let result: boolean | null = true;
    for (let i = 0; i < functionType.parameters.length; i++) {
        let parameter = functionType.parameters[i];
        let parameterType = parameter.type!;
        let argType = argTypes[i];
        let isArgValid = isSubTypeOf(argType, parameterType);
        if (isArgValid === false) {
            return false;
        }
        if (isArgValid === null) {
            result = null;
        }
    }
    return result;
}