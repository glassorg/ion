/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as Class from './ion/Class';
export class DotExpression implements _Object.Object , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    static readonly id = 'DotExpression';
    static readonly implements = new Set([
        'DotExpression',
        'ion_Object',
        'Expression',
        'Node'
    ]);
    constructor({location = null, type = null}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        this.location = location;
        this.type = type;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null
    }) {
        return new DotExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is DotExpression {
        return isDotExpression(value);
    }
}
export function isDotExpression(value): value is DotExpression {
    return Class.isInstance(DotExpression, value);
}
export default DotExpression;