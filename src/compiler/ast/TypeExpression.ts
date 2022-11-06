import { Expression } from "./Expression";

/**
 * A Type expression is an expression which contains DotExpressions.
 * A value is an instance of a type if when the value is substituted for every dot expression
 * the resulting expression is true.
 * Examples:
 *      Number = . is Number
 *      ZeroToOne = . >= 0.0 && . <= 1.0
 */
export type TypeExpression = Expression;