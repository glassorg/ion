import * as kype from "@glas/kype";
import { toIonExpression } from "./kypeToTypeExpression";
import { joinExpressions, splitExpressions } from "../ast/AstFunctions";
import { InfixOperator } from "../Operators";
import { SemanticError } from "../SemanticError";
import { CallExpression } from "../ast/CallExpression";
import { CoreProperty, CoreType, CoreTypes } from "../common/CoreType";
import { Type, toType } from "../ast/Type";
import { ConstrainedType } from "../ast/ConstrainedType";
import { TypeReference } from "../ast/TypeReference";
import { FunctionExpression } from "../ast/FunctionExpression";
import { Declaration } from "../ast/Declaration";
import { EvaluationContext } from "../EvaluationContext";
import { simplify } from "./simplify";
import { IntegerLiteral } from "../ast/IntegerLiteral";
import { Identifier } from "../ast/Identifier";
import { Expression } from "../ast/Expression";
import { SourceLocation } from "../ast/SourceLocation";
import { DotExpression } from "../ast/DotExpression";
import { MemberExpression } from "../ast/MemberExpression";
import { ComparisonExpression } from "../ast/ComparisonExpression";

function combineTypes(a: Type, operator: string, b: Type, coreType: CoreType, location: SourceLocation) {
    const aKype = a.toKype();
    const bKype = b.toKype();
    const kypeExpression = new kype.BinaryExpression(aKype, operator as kype.BinaryOperator, bKype);
    const result = kype.simplify(kypeExpression) as kype.TypeExpression;
    const ionResult = joinExpressions("|", result.proposition.split("||").map(kypeExpr => {
        const constraints = splitExpressions("&&", toIonExpression(kypeExpr, location));
        return constraints.length > 0 ? new ConstrainedType(
            location,
            coreType,
            constraints,
        ) : new TypeReference(location, coreType);
    }));
    return ionResult;
};

function binaryTypeFunction(operator: InfixOperator, coreType: CoreType) {
    return (c: EvaluationContext, callee: Expression, a: Type, b: Type) => {
        return combineTypes(a, operator, b, coreType, callee.location);
    };
}

// this naming property is brittle, we need to use Meta calls.
const nativeFunctionReturnTypes: { [name: string]: ((c: EvaluationContext, callee: CallExpression, ...argTypes: Type[]) => Type) | undefined } = {
    "`+`(Integer{},Integer{})": binaryTypeFunction("+", CoreTypes.Integer),
    "`-`(Integer{},Integer{})": binaryTypeFunction("-", CoreTypes.Integer),
    "`*`(Integer{},Integer{})": binaryTypeFunction("*", CoreTypes.Integer),
    "`**`(Integer{},Integer{})": binaryTypeFunction("**", CoreTypes.Integer),
    "`/`(Integer{},Integer{})": binaryTypeFunction("/", CoreTypes.Integer),
    "`/`(Integer{},Integer{(@ == 0)})": (c, callee) => { throw new SemanticError(`Possible integer division by zero`, callee) },
    "`%`(Integer{},Integer{})": binaryTypeFunction("%", CoreTypes.Integer),
    "`%`(Integer{},0)": (c, callee) => { throw new SemanticError(`Possible integer modulus by zero`, callee) },

    "`**`(Float{},Float{})": binaryTypeFunction("**", CoreTypes.Float),
    "`+`(Float{},Float{})": binaryTypeFunction("+", CoreTypes.Float),
    "`-`(Float{},Float{})": binaryTypeFunction("-", CoreTypes.Float),
    "`*`(Float{},Float{})": binaryTypeFunction("*", CoreTypes.Float),
    "`/`(Float{},Float{})": binaryTypeFunction("/", CoreTypes.Float),
    "`/`(Float{(@ == 0.0)},Float{(@ == 0.0)})": (c, callee) => new TypeReference(callee.location, CoreTypes.NaN),
    "`%`(Float{},Float{})": binaryTypeFunction("%", CoreTypes.Float),
    "`%`(Float{},0.0)": (c, callee) => { throw new SemanticError(`Possible float modulus by zero`, callee) },

    //  new
    "`+`(Integer,Integer)": binaryTypeFunction("+", CoreTypes.Integer),
    "`-`(Integer,Integer)": binaryTypeFunction("-", CoreTypes.Integer),
    "`*`(Integer,Integer)": binaryTypeFunction("*", CoreTypes.Integer),
    "`**`(Integer,Integer)": binaryTypeFunction("**", CoreTypes.Integer),
    "`/`(Integer,Integer)": binaryTypeFunction("/", CoreTypes.Integer),
    "`/`(Integer,Integer{(@ == 0)})": (c, callee) => { throw new SemanticError(`Possible integer division by zero`, callee) },
    "`%`(Integer,Integer)": binaryTypeFunction("%", CoreTypes.Integer),
    "`%`(Integer,0)": (c, callee) => { throw new SemanticError(`Possible integer modulus by zero`, callee) },

    "`**`(Float,Float)": binaryTypeFunction("**", CoreTypes.Float),
    "`+`(Float,Float)": binaryTypeFunction("+", CoreTypes.Float),
    "`-`(Float,Float)": binaryTypeFunction("-", CoreTypes.Float),
    "`*`(Float,Float)": binaryTypeFunction("*", CoreTypes.Float),
    "`/`(Float,Float)": binaryTypeFunction("/", CoreTypes.Float),
    //"`/`(Float{(@ == 0.0)},Float{(@ == 0.0)})": (c, callee) => new TypeReference(callee.location, CoreTypes.NaN),
    "`%`(Float,Float)": binaryTypeFunction("%", CoreTypes.Float),
    "`%`(Float,0.0)": (c, callee) => { throw new SemanticError(`Possible float modulus by zero`, callee) },
    // get array element type
    "get(Array,Integer{(@ < @arg(0).length),(@ >= 0)})": (c, callee, arrayType, indexType) => {
        const elementType = arrayType.getMemberType(indexType, c);
        return elementType!;
    },
    "concat(Array,Array)": (c, callee, a, b) => {
        const elementIndex = new IntegerLiteral(a.location, -1);
        const lengthIdentifier = new Identifier(a.location, CoreProperty.length);
        const aElementType = a.getMemberType(elementIndex, c)!;
        const bElementType = b.getMemberType(elementIndex, c)!;
        const aLength = a.getMemberType(lengthIdentifier, c)!;
        const bLength = b.getMemberType(lengthIdentifier, c)!;
        const elementType = simplify(joinExpressions("|", [aElementType, bElementType]));
        const length = simplify(combineTypes(aLength, "+", bLength, CoreTypes.Integer, a.location));
        const type = new ConstrainedType(
            callee.location,
            new TypeReference(
                callee.location,
                CoreTypes.Array,
                [elementType]
            ),
            [
                new ComparisonExpression(
                    callee.location,
                    new MemberExpression(callee.location,
                        new DotExpression(callee.location),
                        new Identifier(callee.location, CoreProperty.length)
                    ),
                    "is",
                    length
                ),
            ]
        );
        return type;
    }
};

export function getNativeReturnType(c: EvaluationContext, functionValue: FunctionExpression, argTypes: Type[], declaration: Declaration, callee: CallExpression) : Type {
    const nativeTypeName = `${functionValue.id}(${functionValue.parameterTypes.join(`,`)})`;
    // console.log(nativeTypeName + " -> " + argTypes);
    const nativeType = nativeFunctionReturnTypes[nativeTypeName];
    if (!nativeType) {
        throw new SemanticError(`Missing native type ${nativeTypeName}`, declaration.id);
    }
    return nativeType(c, callee, ...argTypes);
}
