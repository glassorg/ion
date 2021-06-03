/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as BinaryExpression from './BinaryExpression';
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class IntersectionType implements _Object.Object , BinaryExpression.BinaryExpression , TypeExpression.TypeExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly left: Expression.Expression;
    readonly operator: String.String;
    readonly right: Expression.Expression;
    static readonly id = 'IntersectionType';
    static readonly implements = new Set([
        'IntersectionType',
        'ion_Object',
        'BinaryExpression',
        'TypeExpression',
        'Expression',
        'Node'
    ]);
    constructor({location = null, left, operator = '&', right}: {
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
    patch(properties: {
        location?: Location.Location | Null.Null,
        left?: Expression.Expression,
        operator?: String.String,
        right?: Expression.Expression
    }) {
        return new IntersectionType({
            ...this,
            ...properties
        });
    }
    static is(value): value is IntersectionType {
        return isIntersectionType(value);
    }
}
export function isIntersectionType(value): value is IntersectionType {
    return Class.isInstance(IntersectionType, value);
}
export default IntersectionType;