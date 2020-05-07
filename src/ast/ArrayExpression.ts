/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as _Array from './ion/Array';
import * as Class from './ion/Class';
export class ArrayExpression implements _Object.Object , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly elements: _Array.Array<Expression.Expression>;
    static readonly id = 'ArrayExpression';
    static readonly implements = new Set([
        'ArrayExpression',
        'ion_Object',
        'Expression',
        'Node'
    ]);
    constructor({location = null, type = null, elements}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        elements: _Array.Array<Expression.Expression>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        if (!_Array.isArray(elements))
            throw new Error('elements is not a Array: ' + elements);
        this.location = location;
        this.type = type;
        this.elements = elements;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        elements?: _Array.Array<Expression.Expression>
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
export function isArrayExpression(value): value is ArrayExpression {
    return Class.isInstance(ArrayExpression, value);
}
export default ArrayExpression;