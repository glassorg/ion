/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class BinaryExpression implements Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly left: Expression.Expression;
    readonly operator: String.String;
    readonly right: Expression.Expression;
    constructor({location = null, left, operator, right}: {
        location?: Location.Location | Null.Null,
        left: Expression.Expression,
        operator: String.String,
        right: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!Expression.isExpression(left))
            throw new Error('left is not a Expression: ' + left);
        if (!String.isString(operator))
            throw new Error('operator is not a String: ' + operator);
        if (!Expression.isExpression(right))
            throw new Error('right is not a Expression: ' + right);
        this.location = location;
        this.left = left;
        this.operator = operator;
        this.right = right;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        left?: Expression.Expression,
        operator?: String.String,
        right?: Expression.Expression
    }) {
        return new BinaryExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is BinaryExpression {
        return isBinaryExpression(value);
    }
}
BinaryExpression['id'] = 'BinaryExpression';
BinaryExpression['implements'] = new Set([
    'BinaryExpression',
    'Expression',
    'Node'
]);
export function isBinaryExpression(value): value is BinaryExpression {
    return Class.isInstance(BinaryExpression, value);
}
export default BinaryExpression;