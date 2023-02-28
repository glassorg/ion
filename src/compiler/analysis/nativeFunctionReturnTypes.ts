import * as kype from "@glas/kype";
import { kypeToTypeExpression } from "./kypeToTypeExpression";
import { joinExpressions } from "../ast/AstFunctions";
import { InfixOperator } from "../Operators";
import { Literal } from "@glas/kype";
import { SemanticError } from "../SemanticError";
import { CallExpression } from "../ast/CallExpression";
import { getTypeAssertion } from "../common/utility";
import { CoreType, CoreTypes } from "../common/CoreType";
import { SourceLocation } from "../ast/SourceLocation";
import { simplify } from "./combineTypes";
import { Type } from "../ast/Type";
import { TypeExpression } from "../ast/TypeExpression";
import { Expression } from "../ast/Expression";

function isAnyFloat(result: kype.TypeExpression) {
    const prop = result.proposition;
    return prop instanceof kype.BinaryExpression
        // && prop.left instanceof kype.DotExpression
        && prop.operator === "<="
        && prop.right instanceof Literal
        && prop.right.value == Number.POSITIVE_INFINITY;
}

function addCoreType(input: kype.TypeExpression, coreType: CoreType, location: SourceLocation): Type {
    const typeAssertion = getTypeAssertion(coreType, location);
    let output: Expression;
    if (isAnyFloat(input)) {
        if (coreType !== CoreTypes.Float) {
            throw new Error("Expected CoreType Float: " + coreType);
        }
        output = typeAssertion;
    }
    else {
        output = simplify(
            joinExpressions("&&", [typeAssertion, kypeToTypeExpression(input).proposition])
        );
    }
    return new TypeExpression(location, output);
}

function binaryTypeFunction(operator: InfixOperator, coreType: CoreType) {
    return (callee: CallExpression, a: Type, b: Type) => {
        const result = kype.combineTypes(a.toKype(), operator as kype.BinaryOperator, b.toKype());
        try {
            return addCoreType(result, coreType, callee.location);
        }
        catch (e) {
            console.log({
                aKype: a.toKype().toString(),
                operator,
                bKype: b.toKype().toString(),
                result: result.toString()
            })
            throw e;
        }
    };
}

export const nativeFunctionReturnTypes: { [name: string]: ((callee: CallExpression, ...argTypes: Type[]) => Type) | undefined } = {
    "`+`(Integer,Integer)": binaryTypeFunction("+", CoreTypes.Integer),
    "`-`(Integer,Integer)": binaryTypeFunction("-", CoreTypes.Integer),
    "`*`(Integer,Integer)": binaryTypeFunction("*", CoreTypes.Integer),
    "`**`(Integer,Integer)": binaryTypeFunction("**", CoreTypes.Integer),
    "`/`(Integer,Integer)": binaryTypeFunction("/", CoreTypes.Integer),
    "`/`(Integer,0)": (callee) => { throw new SemanticError(`Possible integer division by zero`, callee) },
    "`%`(Integer,Integer)": binaryTypeFunction("%", CoreTypes.Integer),
    "`%`(Integer,0)": (callee) => { throw new SemanticError(`Possible integer modulus by zero`, callee) },

    "`**`(Float,Integer)": binaryTypeFunction("**", CoreTypes.Float),
    "`+`(Float,Float)": binaryTypeFunction("+", CoreTypes.Float),
    "`-`(Float,Float)": binaryTypeFunction("-", CoreTypes.Float),
    "`*`(Float,Float)": binaryTypeFunction("*", CoreTypes.Float),
    "`**`(Float,Float)": (callee) => { throw new SemanticError(`Exponent must be an integer`, callee) },
    "`/`(Float,Float)": binaryTypeFunction("/", CoreTypes.Float),
    "`%`(Float,Float)": binaryTypeFunction("%", CoreTypes.Float),
};
