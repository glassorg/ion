import { isSubType } from "../analysis/isSubType";
import { AstNode } from "./AstNode";
import { ParameterDeclaration } from "./ParameterDeclaration";
import { TypeExpression } from "./TypeExpression";

export interface FunctionType extends AstNode {

    readonly parameters: ParameterDeclaration[];
    getReturnType(argumentTypes: TypeExpression[]): TypeExpression;

}

export function areValidArguments(functionType: FunctionType, argTypes: TypeExpression[]): boolean | null {
    if (functionType.parameters.length !== argTypes.length) {
        return false;
    }
    let result: boolean | null = true;
    for (let i = 0; i < functionType.parameters.length; i++) {
        let parameter = functionType.parameters[i];
        let parameterType = parameter.declaredType!;
        let argType = argTypes[i];
        let isArgValid = isSubType(argType, parameterType);
        if (isArgValid === false) {
            return false;
        }
        if (isArgValid === null) {
            result = null;
        }
    }
    return result;
}