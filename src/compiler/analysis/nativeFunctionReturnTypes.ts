import { TypeExpression } from "../ast/TypeExpression";
import * as kype from "@glas/kype";
import { kypeToTypeExpression } from "./kypeToTypeExpression";
import { joinExpressions } from "../ast";
import { CoreType, getTypeAssertion } from "../common/types";

function toCoreType(result: kype.TypeExpression, coreType: CoreType) {
    return joinExpressions("&&", [getTypeAssertion(coreType), kypeToTypeExpression(result)]);
}

export const nativeFunctionReturnTypes: { [name: string]: ((...argTypes: TypeExpression[]) => TypeExpression) | undefined } = {
    "`+`(Integer,Integer)": (a: TypeExpression, b: TypeExpression) => {
        const result = kype.combineTypes(a.toKypeType(), "+", b.toKypeType());
        return toCoreType(result, CoreType.Integer);
    }
};
