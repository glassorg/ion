import { TypeExpression } from "../ast/TypeExpression";
import * as kype from "@glas/kype";
import { kypeToTypeExpression } from "./kypeToTypeExpression";
import { joinExpressions } from "../ast/AstFunctions";
import { InfixOperator } from "../Operators";
import { Literal } from "@glas/kype";
import { SemanticError } from "../SemanticError";
import { CallExpression } from "../ast/CallExpression";
import { getTypeAssertion } from "../common/utility";
import { CoreType, CoreTypes } from "../common/CoreType";

function isAnyFloat(result: kype.TypeExpression) {
    const prop = result.proposition;
    return prop instanceof kype.BinaryExpression
        && prop.left instanceof kype.DotExpression
        && prop.operator === "<="
        && prop.right instanceof Literal
        && prop.right.value == Number.POSITIVE_INFINITY;
}

function addCoreType(result: kype.TypeExpression, coreType: CoreType) {
    const typeAssertion = getTypeAssertion(coreType)
    if (isAnyFloat(result)) {
        if (coreType !== CoreTypes.Float) {
            throw new Error("Expected CoreType Float: " + coreType);
        }
        return typeAssertion;
    }
    return joinExpressions("&&", [typeAssertion, kypeToTypeExpression(result)]);
}

function binaryTypeFunction(operator: InfixOperator, coreType: CoreType) {
    return (callee: CallExpression, a: TypeExpression, b: TypeExpression) => {
        const result = kype.combineTypes(a.toKypeType(), operator, b.toKypeType());
        return addCoreType(result, coreType);
    };
}

export const nativeFunctionReturnTypes: { [name: string]: ((callee: CallExpression, ...argTypes: TypeExpression[]) => TypeExpression) | undefined } = {
    "`+`(Integer,Integer)": binaryTypeFunction("+", CoreTypes.Integer),
    "`*`(Integer,Integer)": binaryTypeFunction("*", CoreTypes.Integer),
    "`**`(Integer,Integer)": binaryTypeFunction("**", CoreTypes.Integer),
    "`/`(Integer,Integer)": binaryTypeFunction("/", CoreTypes.Integer),
    "`/`(Integer,0)": (callee) => { throw new SemanticError(`Possible integer division by zero`, callee) },
    "`%`(Integer,Integer)": binaryTypeFunction("%", CoreTypes.Integer),
    "`%`(Integer,0)": (callee) => { throw new SemanticError(`Possible integer modulus by zero`, callee) },

    "`**`(Float,Integer)": binaryTypeFunction("**", CoreTypes.Float),
    "`+`(Float,Float)": binaryTypeFunction("+", CoreTypes.Float),
    "`*`(Float,Float)": binaryTypeFunction("*", CoreTypes.Float),
    "`**`(Float,Float)": (callee) => { throw new SemanticError(`Exponent must be an integer`, callee) },
    "`/`(Float,Float)": binaryTypeFunction("/", CoreTypes.Float),
    "`%`(Float,Float)": binaryTypeFunction("%", CoreTypes.Float),
};
