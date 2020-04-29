/*
This file was generated from ion source. Do not edit.
*/
import * as BinaryExpression from './BinaryExpression';
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class UnionType {
    readonly location: Location.Location | Null.Null;
    readonly left: Expression.Expression;
    readonly operator: String.String;
    readonly right: Expression.Expression;
    constructor({location = null, left, operator = '|', right}: {
        location?: Location.Location | Null.Null,
        left: Expression.Expression,
        operator?: String.String,
        right: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Expression.isExpression(left))
            throw new Error('left is not a Expression: ' + Class.toString(left));
        if (!String.isString(operator))
            throw new Error('operator is not a String: ' + Class.toString(operator));
        if (!Expression.isExpression(right))
            throw new Error('right is not a Expression: ' + Class.toString(right));
        this.location = location;
        this.left = left;
        this.operator = operator;
        this.right = right;
        Object.freeze(this);
    }
    static is(value): value is UnionType {
        return isUnionType(value);
    }
}
UnionType['id'] = 'UnionType';
UnionType['implements'] = new Set([
    'UnionType',
    'BinaryExpression',
    'TypeExpression',
    'Expression',
    'Node',
    'Expression'
]);
export const isUnionType = function (value): value is UnionType {
    return Class.isInstance(UnionType, value);
};
export default UnionType;