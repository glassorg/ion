/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as String from './ion/String';
import * as Expression from './Expression';
import * as Class from './ion/Class';
export class UnaryExpression implements _Object.Object {
    readonly operator: String.String;
    readonly argument: Expression.Expression;
    static readonly id = 'UnaryExpression';
    static readonly implements = new Set([
        'UnaryExpression',
        'ion_Object'
    ]);
    constructor({operator, argument}: {
        operator: String.String,
        argument: Expression.Expression
    }) {
        if (!String.isString(operator))
            throw new Error('operator is not a String: ' + operator);
        if (!Expression.isExpression(argument))
            throw new Error('argument is not a Expression: ' + argument);
        this.operator = operator;
        this.argument = argument;
        Object.freeze(this);
    }
    patch(properties: {
        operator?: String.String,
        argument?: Expression.Expression
    }) {
        return new UnaryExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is UnaryExpression {
        return isUnaryExpression(value);
    }
}
export function isUnaryExpression(value): value is UnaryExpression {
    return Class.isInstance(UnaryExpression, value);
}
export default UnaryExpression;