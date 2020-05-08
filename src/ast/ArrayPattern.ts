/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as ArrayExpression from './ArrayExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Typed from './Typed';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as _Array from './ion/Array';
import * as Class from './ion/Class';
export class ArrayPattern implements _Object.Object , ArrayExpression.ArrayExpression , Expression.Expression , Node.Node , Typed.Typed {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly elements: _Array.Array<Expression.Expression>;
    static readonly id = 'ArrayPattern';
    static readonly implements = new Set([
        'ArrayPattern',
        'ion_Object',
        'ArrayExpression',
        'Expression',
        'Node',
        'Typed'
    ]);
    constructor({location = null, type = null, elements}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        elements: _Array.Array<Expression.Expression>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + Class.toString(type));
        if (!_Array.isArray(elements))
            throw new Error('elements is not a Array: ' + Class.toString(elements));
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
        return new ArrayPattern({
            ...this,
            ...properties
        });
    }
    static is(value): value is ArrayPattern {
        return isArrayPattern(value);
    }
}
export function isArrayPattern(value): value is ArrayPattern {
    return Class.isInstance(ArrayPattern, value);
}
export default ArrayPattern;