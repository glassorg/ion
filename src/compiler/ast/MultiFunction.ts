import { combineTypes } from "../analysis/combineTypes";
import { areSubTypesOf, isSubTypeOf } from "../analysis/isSubType";
import { nativeFunctionReturnTypes } from "../analysis/nativeFunctionReturnTypes";
import { CoreTypes } from "../common/CoreType";
import { EvaluationContext } from "../EvaluationContext";
import { SemanticError } from "../SemanticError";
import { CallExpression } from "./CallExpression";
import { Expression } from "./Expression";
import { FunctionExpression } from "./FunctionExpression";
import { Reference } from "./Reference";
import { SourceLocation } from "./SourceLocation";
import { Type } from "./Type";

export class MultiFunction extends Expression {

    public readonly sorted = false;

    constructor(
        public readonly name: string,
        public readonly functions: Reference[],
    ) {
        super(SourceLocation.empty);
    }

    toString() {
        return `multifunction ${this.toBlockString(this.functions, "[", "]")}`;
    }

    toSorted(c: EvaluationContext): MultiFunction {
        type Pair = [Reference, FunctionExpression];
        const pairs: Pair[] = this.functions.map(ref => [ref, c.getConstantValue(ref) as FunctionExpression]);
        pairs.sort((a, b) => {
            let aParams = a[1].parameterTypes;
            let bParams = b[1].parameterTypes;
            for (let i = 0; i < aParams.length; i++) {
                let aType = aParams[i];
                let bType = bParams[i];
                if (!bType) {
                    // if less parameters then comes first.
                    return -1;
                }
                if (aType.toString() === bType.toString()) {
                    continue;
                }
                const isASubTypeOfB = isSubTypeOf(aType, bType);
                const isBSubTypeOfA = isSubTypeOf(bType, aType);
                if (isASubTypeOfB && isBSubTypeOfA) {
                    continue;
                }
                if (isASubTypeOfB === true) {
                    // if subtype then comes first.
                    return -1;
                }
                if (isBSubTypeOfA === true) {
                    // if the other is subtype then this comes after.
                    return +1;
                }
            }
            return 0;
        });

        const sortedFunctions = pairs.map(p => p[0])

        // console.log(`SORTED: ${this.name}`);
        // console.log(`${pairs.map(p => `    ${p[1].type}\n`).join("")}`);

        return this.patch<MultiFunction>({ functions: sortedFunctions });
    }

    getReturnType(argTypes: Type[], c: EvaluationContext, callee: CallExpression): Type {
        const returnTypes: Type[] = [];

        // const DEBUG = (callee.toString() + this.functions[2].toString()) === '`/`(`a:18:0`, `b:18:2`)`Integer./.1`';
        // if (DEBUG) {
        //     debugger;
        // }
        for (let func of this.functions) {
            const declaration = c.getDeclaration(func);
            const functionValue = c.getConstantValue(func) as FunctionExpression;
            // first see if this function is valid for these argument types.
            const isValidCall = areSubTypesOf(argTypes, functionValue.parameterTypes);
            if (isValidCall === false) {
                // this is never a valid call so we skip it's return type.
                continue;
            }

            const nativeCalls = declaration.getMetaCallsByName(CoreTypes.Native);
            let returnType: Type | undefined;
            if (nativeCalls.length > 0) {
                const nativeTypeName = `${functionValue.id}(${functionValue.parameterTypes.join(`,`)})`;
                const nativeType = nativeFunctionReturnTypes[nativeTypeName];
                if (!nativeType) {
                    throw new SemanticError(`Missing native type ${nativeTypeName}`, declaration.id);
                }
                returnType = nativeType(callee, ...argTypes);
            }
            else {
                returnType = functionValue.returnType!;
            }

            if (returnType) {
                returnTypes.push(returnType);
            }

            if (isValidCall === true) {
                //  this is ALWAYS a valid call so we know no later functions will be called
                //  so we break the loop and add no further types to the possible types.
                break;
            }
        }
        const type = combineTypes("||", returnTypes);
        return type;
    }

}