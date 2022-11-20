import { joinExpressions } from ".";
import { ComparisonExpression } from "./ComparisonExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { LogicalExpression } from "./LogicalExpression";
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
            if (term instanceof Reference) {
                term = new ComparisonExpression(term.location, new DotExpression(term.location), "is", term)
            }
            return term;
        }));
    }));
}