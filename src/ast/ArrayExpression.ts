/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Array from './ion/Array';
import * as Class from './ion/Class';
export class ArrayExpression implements Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly elements: Array.Array<Expression.Expression>;
    constructor({location = null, elements}: {
        location?: Location.Location | Null.Null,
        elements: Array.Array<Expression.Expression>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!Array.isArray(elements))
            throw new Error('elements is not a Array: ' + elements);
        this.location = location;
        this.elements = elements;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        elements?: Array.Array<Expression.Expression>
    }) {
        return new ArrayExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is ArrayExpression {
        return isArrayExpression(value);
    }
}
ArrayExpression['id'] = 'ArrayExpression';
ArrayExpression['implements'] = new Set([
    'ArrayExpression',
    'Expression',
    'Node'
]);
export function isArrayExpression(value): value is ArrayExpression {
    return Class.isInstance(ArrayExpression, value);
}
export default ArrayExpression;