import { joinExpressions } from ".";
import { CoreTypes } from "../common/CoreType";
import { getTypeAssertion } from "../common/utility";
import { SemanticError } from "../SemanticError";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { FloatLiteral } from "./FloatLiteral";
import { IntegerLiteral } from "./IntegerLiteral";
import { Literal } from "./Literal";
import { RangeExpression } from "./RangeExpression";
import { Reference } from "./Reference";

/**
 * A Type expression is an expression which contains DotExpressions.
 * A value is an instance of a type if when the value is substituted for every dot expression
 * the resulting expression is true.
 * Examples:
 *      Number = . is Number
 *      ZeroToOne = . >= 0.0 && . <= 1.0
 */
export type TypeExpression = Expression;

export function toTypeExpression(e: Expression): TypeExpression {
    return joinExpressions("||", e.split("|").map(option => {
        return joinExpressions("&&", option.split("&").map(term => {
            //  we can't convert to range without knowing
            if (term instanceof RangeExpression) {
                const { start, finish } = term;
                if (!(
                    ((start instanceof IntegerLiteral) && (finish instanceof IntegerLiteral))
                    ||
                    ((start instanceof FloatLiteral) && (finish instanceof FloatLiteral))
                )) {
                    console.log({ start, finish })
                    throw new SemanticError(`Range start and finish operators in type expressions must both be numeric literals of the same type`, term);
                }
                if (!(finish.value > start.value)) {
                    throw new SemanticError(`Range finish must be more than start`, term);
                }
                const coreType = start instanceof IntegerLiteral ? CoreTypes.Integer : CoreTypes.Float;
                term = joinExpressions("&&", [
                    new ComparisonExpression(term.location, new DotExpression(term.location), ">=", term.start),
                    new ComparisonExpression(term.location, new DotExpression(term.location), "<", term.finish),
                    getTypeAssertion(coreType)
                ]);
            }
            if (term instanceof Reference || term instanceof Literal) {
                const operator = term instanceof Reference ? "is" : "==";
                term = new ComparisonExpression(term.location, new DotExpression(term.location), operator, term);
            }
            return term;
        }));
    }));
}