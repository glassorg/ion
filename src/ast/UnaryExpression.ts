/*
This file was generated from ion source. Do not edit.
*/
import * as String from './ion/String';
import * as Expression from './Expression';
import * as Class from './ion/Class';
export class UnaryExpression {
    readonly operator: String.String;
    readonly argument: Expression.Expression;
    constructor({operator, argument}: {
        operator: String.String,
        argument: Expression.Expression
    }) {
        if (!String.isString(operator))
            throw new Error('operator is not a String: ' + Class.toString(operator));
        if (!Expression.isExpression(argument))
            throw new Error('argument is not a Expression: ' + Class.toString(argument));
        this.operator = operator;
        this.argument = argument;
        Object.freeze(this);
    }
    static is(value): value is UnaryExpression {
        return isUnaryExpression(value);
    }
}
UnaryExpression['id'] = 'UnaryExpression';
UnaryExpression['implements'] = new Set(['UnaryExpression']);
export const isUnaryExpression = function (value): value is UnaryExpression {
    return Class.isInstance(UnaryExpression, value);
};
export default UnaryExpression;