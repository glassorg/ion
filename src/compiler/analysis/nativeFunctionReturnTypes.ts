import * as kype from "@glas/kype";
import { kypeToTypeExpression } from "./kypeToTypeExpression";
import { joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { InfixOperator } from "../Operators";
import { Literal } from "@glas/kype";
import { SemanticError } from "../SemanticError";
import { CallExpression } from "../ast/CallExpression";
import { CoreType, CoreTypes } from "../common/CoreType";
import { SourceLocation } from "../ast/SourceLocation";
import { simplify } from "./combineTypes";
import { Type } from "../ast/Type";
import { Expression } from "../ast/Expression";
import { TypeConstraint } from "../ast/TypeConstraint";
import { TypeReference } from "../ast/TypeReference";

function isAnyFloat(result: kype.TypeExpression) {
    const prop = result.proposition;
    return prop instanceof kype.BinaryExpression
        // && prop.left instanceof kype.DotExpression
        && prop.operator === "<="
        && prop.right instanceof Literal
        && prop.right.value == Number.POSITIVE_INFINITY;
}

function binaryTypeFunction(operator: InfixOperator, coreType: CoreType) {
    return (callee: CallExpression, a: Type, b: Type) => {
        const result = kype.combineTypes(
            new kype.TypeExpression(a.toKype()),
            operator as kype.BinaryOperator,
            new kype.TypeExpression(b.toKype())
        );
        // try {
        return new TypeConstraint(
            callee.location,
            coreType,
            splitExpressions("&&", kypeToTypeExpression(result))
        );
        // }
        // catch (e) {
        //     console.log({
        //         aKype: a.toKype().toString(),
        //         operator,
        //         bKype: b.toKype().toString(),
        //         result: result.toString()
        //     })
        //     throw e;
        // }
    };
}

// this naming property is brittle, we need to use Meta calls.
export const nativeFunctionReturnTypes: { [name: string]: ((callee: CallExpression, ...argTypes: Type[]) => Type) | undefined } = {
    "`+`(Integer{},Integer{})": binaryTypeFunction("+", CoreTypes.Integer),
    "`-`(Integer{},Integer{})": binaryTypeFunction("-", CoreTypes.Integer),
    "`*`(Integer{},Integer{})": binaryTypeFunction("*", CoreTypes.Integer),
    "`**`(Integer{},Integer{})": binaryTypeFunction("**", CoreTypes.Integer),
    "`/`(Integer{},Integer{})": binaryTypeFunction("/", CoreTypes.Integer),
    "`/`(Integer,0)": (callee) => { throw new SemanticError(`Possible integer division by zero`, callee) },
    "`%`(Integer{},Integer{})": binaryTypeFunction("%", CoreTypes.Integer),
    "`%`(Integer{},0)": (callee) => { throw new SemanticError(`Possible integer modulus by zero`, callee) },

    "`**`(Float{},Integer{})": binaryTypeFunction("**", CoreTypes.Float),
    "`+`(Float{},Float{})": binaryTypeFunction("+", CoreTypes.Float),
    "`-`(Float{},Float{})": binaryTypeFunction("-", CoreTypes.Float),
    "`*`(Float{},Float{})": binaryTypeFunction("*", CoreTypes.Float),
    "`**`(Float{},Float{})": (callee) => { throw new SemanticError(`Exponent must be an integer`, callee) },
    "`/`(Float{},Float{})": binaryTypeFunction("/", CoreTypes.Float),
    "`/`(Float{(. == 0.0)},Float{(. == 0.0)})": (callee) => new TypeConstraint(callee.location, CoreTypes.NaN),
    "`%`(Float{},Float{})": binaryTypeFunction("%", CoreTypes.Float),
    "`%`(Float{},0.0)": (callee) => { throw new SemanticError(`Possible float modulus by zero`, callee) },
};
