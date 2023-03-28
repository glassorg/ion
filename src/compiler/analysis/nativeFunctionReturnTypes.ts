import * as kype from "@glas/kype";
import { toIonExpression } from "./kypeToTypeExpression";
import { joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { InfixOperator } from "../Operators";
import { SemanticError } from "../SemanticError";
import { CallExpression } from "../ast/CallExpression";
import { CoreType, CoreTypes } from "../common/CoreType";
import { Type } from "../ast/Type";
import { ConstrainedType } from "../ast/ConstrainedType";
import { TypeReference } from "../ast/TypeReference";

function binaryTypeFunction(operator: InfixOperator, coreType: CoreType) {
    return (callee: CallExpression, a: Type, b: Type) => {
        const aKype = a.toKype();
        const bKype = b.toKype();
        const kypeExpression = new kype.BinaryExpression(aKype, operator as kype.BinaryOperator, bKype);
        const result = kype.simplify(kypeExpression) as kype.TypeExpression;
        const ionResult = joinExpressions("|", result.proposition.split("||").map(kypeExpr => {
            const constraints = splitExpressions("&&", toIonExpression(kypeExpr, callee.location));
            return constraints.length > 0 ? new ConstrainedType(
                callee.location,
                coreType,
                constraints,
            ) : new TypeReference(callee.location, coreType);
        }));
        return ionResult;
    };
}

// this naming property is brittle, we need to use Meta calls.
export const nativeFunctionReturnTypes: { [name: string]: ((callee: CallExpression, ...argTypes: Type[]) => Type) | undefined } = {
    "`+`(Integer{},Integer{})": binaryTypeFunction("+", CoreTypes.Integer),
    "`-`(Integer{},Integer{})": binaryTypeFunction("-", CoreTypes.Integer),
    "`*`(Integer{},Integer{})": binaryTypeFunction("*", CoreTypes.Integer),
    "`**`(Integer{},Integer{})": binaryTypeFunction("**", CoreTypes.Integer),
    "`/`(Integer{},Integer{})": binaryTypeFunction("/", CoreTypes.Integer),
    "`/`(Integer{},Integer{(@ == 0)})": (callee) => { throw new SemanticError(`Possible integer division by zero`, callee) },
    "`%`(Integer{},Integer{})": binaryTypeFunction("%", CoreTypes.Integer),
    "`%`(Integer{},0)": (callee) => { throw new SemanticError(`Possible integer modulus by zero`, callee) },

    "`**`(Float{},Float{})": binaryTypeFunction("**", CoreTypes.Float),
    "`+`(Float{},Float{})": binaryTypeFunction("+", CoreTypes.Float),
    "`-`(Float{},Float{})": binaryTypeFunction("-", CoreTypes.Float),
    "`*`(Float{},Float{})": binaryTypeFunction("*", CoreTypes.Float),
    "`/`(Float{},Float{})": binaryTypeFunction("/", CoreTypes.Float),
    "`/`(Float{(@ == 0.0)},Float{(@ == 0.0)})": (callee) => new TypeReference(callee.location, CoreTypes.NaN),
    "`%`(Float{},Float{})": binaryTypeFunction("%", CoreTypes.Float),
    "`%`(Float{},0.0)": (callee) => { throw new SemanticError(`Possible float modulus by zero`, callee) },

    //  new
    "`+`(Integer,Integer)": binaryTypeFunction("+", CoreTypes.Integer),
    "`-`(Integer,Integer)": binaryTypeFunction("-", CoreTypes.Integer),
    "`*`(Integer,Integer)": binaryTypeFunction("*", CoreTypes.Integer),
    "`**`(Integer,Integer)": binaryTypeFunction("**", CoreTypes.Integer),
    "`/`(Integer,Integer)": binaryTypeFunction("/", CoreTypes.Integer),
    "`/`(Integer,Integer{(@ == 0)})": (callee) => { throw new SemanticError(`Possible integer division by zero`, callee) },
    "`%`(Integer,Integer)": binaryTypeFunction("%", CoreTypes.Integer),
    "`%`(Integer,0)": (callee) => { throw new SemanticError(`Possible integer modulus by zero`, callee) },

    "`**`(Float,Float)": binaryTypeFunction("**", CoreTypes.Float),
    "`+`(Float,Float)": binaryTypeFunction("+", CoreTypes.Float),
    "`-`(Float,Float)": binaryTypeFunction("-", CoreTypes.Float),
    "`*`(Float,Float)": binaryTypeFunction("*", CoreTypes.Float),
    "`/`(Float,Float)": binaryTypeFunction("/", CoreTypes.Float),
    //"`/`(Float{(@ == 0.0)},Float{(@ == 0.0)})": (callee) => new TypeReference(callee.location, CoreTypes.NaN),
    "`%`(Float,Float)": binaryTypeFunction("%", CoreTypes.Float),
    "`%`(Float,0.0)": (callee) => { throw new SemanticError(`Possible float modulus by zero`, callee) },


};
