import { isSubTypeOf } from "../analysis/isSubType";
import { SourceLocation } from "./SourceLocation";
import * as kype from "@glas/kype";
import { Type } from "./Type";
import { Expression } from "./Expression";

export class FunctionType extends Expression implements Type {

    constructor(
        location: SourceLocation,
        public readonly parameterTypes: Type[],
        public readonly returnType: Type
    ) {
        super(location);
    }

    get isType(): true { return true }

    toString() {
        return `(${this.parameterTypes.map(p => p.toUserTypeString()).join(",")}) => ${this.returnType?.toUserTypeString()}`;
    }

    toKype(): kype.TypeExpression {
        return new kype.TypeExpression(new kype.CustomExpression(this));
    }

    areArgumentsValid(argumentTypes: Type[]): boolean | null {
        // if these argumentTypes are not valid arguments for this function we return undefined
        const parameterTypes = this.parameterTypes;
        if (argumentTypes.length !== parameterTypes.length) {
            return false;
        }
        let areAllValid = false;
        for (let i = 0; i < argumentTypes.length; i++) {
            let argType = argumentTypes[i];
            let paramType = parameterTypes[i];
            let isArgValid = isSubTypeOf(argType, paramType);
            if (`isSubTypeOf(${argType}, ${paramType}) => ${isArgValid}` === "isSubTypeOf(((. >= 1) && ((. < 3) && (. is Integer))), (. is Float)) => null") {
                debugger;
                isArgValid = isSubTypeOf(argType, paramType);
                console.log(`isSubTypeOf(${argType}, ${paramType}) => ${isArgValid}`)
            }
            if (isArgValid === false) {
                return false;
            }
            if (isArgValid === null) {
                areAllValid = false;
            }
        }
        return areAllValid ? true : null;
    }
}

// export function areValidArguments(functionType: OldFunctionType, argTypes: TypeExpression[]): boolean | null {
//     if (functionType.parameters.length !== argTypes.length) {
//         return false;
//     }
//     let result: boolean | null = true;
//     for (let i = 0; i < functionType.parameters.length; i++) {
//         let parameter = functionType.parameters[i];
//         let parameterType = parameter.type!;
//         let argType = argTypes[i];
//         let isArgValid = isSubTypeOf(argType, parameterType);
//         if (isArgValid === false) {
//             return false;
//         }
//         if (isArgValid === null) {
//             result = null;
//         }
//     }
//     return result;
// }