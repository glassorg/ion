/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class TypeExpression implements _Object.Object , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression | Null.Null;
    static readonly id = 'TypeExpression';
    static readonly implements = new Set([
        'TypeExpression',
        'ion_Object',
        'Expression',
        'Node'
    ]);
    constructor({location = null, type = null}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression | Null.Null
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        this.location = location;
        this.type = type;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression | Null.Null
    }) {
        return new TypeExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is TypeExpression {
        return isTypeExpression(value);
    }
}
export function isTypeExpression(value): value is TypeExpression {
    return Class.isInstance(TypeExpression, value);
}
export default TypeExpression;