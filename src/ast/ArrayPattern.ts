/*
This file was generated from ion source. Do not edit.
*/
import * as ArrayExpression from './ArrayExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Array from './ion/Array';
import * as Class from './ion/Class';
export class ArrayPattern implements ArrayExpression.ArrayExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly elements: Array.Array<Expression.Expression>;
    constructor({location = null, elements}: {
        location?: Location.Location | Null.Null,
        elements: Array.Array<Expression.Expression>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Array.isArray(elements))
            throw new Error('elements is not a Array: ' + Class.toString(elements));
        this.location = location;
        this.elements = elements;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        elements?: Array.Array<Expression.Expression>
    }) {
        return new ArrayPattern({
            ...this,
            ...properties
        });
    }
    static is(value): value is ArrayPattern {
        return isArrayPattern(value);
    }
}
ArrayPattern['id'] = 'ArrayPattern';
ArrayPattern['implements'] = new Set([
    'ArrayPattern',
    'ArrayExpression',
    'Expression',
    'Node'
]);
export const isArrayPattern = function (value): value is ArrayPattern {
    return Class.isInstance(ArrayPattern, value);
};
export default ArrayPattern;