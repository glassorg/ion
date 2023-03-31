import { simplify } from "../analysis/simplify";
import { areSubTypesOf, getSubTypePercentage, isSubTypeOf } from "../analysis/isSubType";
import { nativeFunctionReturnTypes } from "../analysis/nativeFunctionReturnTypes";
import { CoreTypes } from "../common/CoreType";
import { EvaluationContext } from "../EvaluationContext";
import { SemanticError } from "../SemanticError";
import { joinExpressions } from "./AstFunctions";
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

    toString(user?: boolean) {
        return `multifunction ${this.toBlockString(user, this.functions, "[", "]")}`;
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

        let lastWasAlwaysMatch = false;
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
                // console.log(`${functionValue.parameterTypes.join(",")}(${argTypes.join(",")}) => ${returnType}`)
                returnTypes.push(returnType);
            }

            if (isValidCall === true) {
                lastWasAlwaysMatch = true;
                //  this is ALWAYS a valid call so we know no later functions will be called
                //  so we break the loop and add no further types to the possible types.
                break;
            }
        }
        if (returnTypes.length === 0) {
            // find the function that is the best match.
            this.throwFunctionNotFoundError(argTypes, c, callee);
        }
        if (!lastWasAlwaysMatch) {
            throw new SemanticError(`Function arguments may not always match: ${this.name}(${argTypes.join(",")})`, callee);
        }
        const type = simplify(joinExpressions("|", returnTypes));
        return type;
    }

    getBestFunctionCall(argTypes: Type[], c: EvaluationContext): Reference {
        if (this.functions.length === 1) {
            return this.functions[0];
        }
        let bestPercent = 0;
        let bestFunc: Reference | undefined;
        for (let func of this.functions) {
            const functionValue = c.getConstantValue(func) as FunctionExpression;
            const percent = getSubTypePercentage(argTypes, functionValue.parameterTypes);
            //  we accept >= so that the farthest back function wins.
            //  this is because the farthest back should be the least restrictive.
            if (!bestFunc || percent >= bestPercent) {
                bestPercent = percent;
                bestFunc = func;
            }
        }
        return bestFunc!;
    }

    throwFunctionNotFoundError(argTypes: Type[], c: EvaluationContext, callee: CallExpression) {
        const func = this.getBestFunctionCall(argTypes, c);
        const functionValue = c.getConstantValue(func) as FunctionExpression;
        const { parameterTypes } = functionValue;
        for (let i = 0; i < argTypes.length; i++) {
            const argType = argTypes[i];
            const paramType = parameterTypes[i];
            const result = isSubTypeOf(argType, paramType);
            if (result !== true) {
                const parameter = functionValue.parameters[i];
                debugger;
                const result2 = paramType.toUserString();
                throw new SemanticError(`${argType.toUserString()} ${result === null ? `may` : `does`} not match parameter ${parameter.id.toUserString()} : ${paramType.toUserString()}`, callee.args[i]);
            }
        }

        throw new SemanticError(`This should never happen`, callee);
    }

}