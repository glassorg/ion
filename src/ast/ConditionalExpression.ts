/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class ConditionalExpression {
    readonly location: Location.Location | Null.Null;
    readonly test: Expression.Expression;
    readonly consequent: Expression.Expression;
    readonly alternate: Expression.Expression;
    constructor({location = null, test, consequent, alternate}: {
        location?: Location.Location | Null.Null,
        test: Expression.Expression,
        consequent: Expression.Expression,
        alternate: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Expression.isExpression(test))
            throw new Error('test is not a Expression: ' + Class.toString(test));
        if (!Expression.isExpression(consequent))
            throw new Error('consequent is not a Expression: ' + Class.toString(consequent));
        if (!Expression.isExpression(alternate))
            throw new Error('alternate is not a Expression: ' + Class.toString(alternate));
        this.location = location;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    static is(value): value is ConditionalExpression {
        return isConditionalExpression(value);
    }
}
ConditionalExpression['id'] = 'ConditionalExpression';
ConditionalExpression['implements'] = new Set([
    'ConditionalExpression',
    'Expression',
    'Node'
]);
export const isConditionalExpression = function (value): value is ConditionalExpression {
    return Class.isInstance(ConditionalExpression, value);
};
export default ConditionalExpression;