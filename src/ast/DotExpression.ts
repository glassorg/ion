/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as Reference from './Reference';
import * as Class from './ion/Class';
export class DotExpression implements _Object.Object , Expression.Expression , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | (Reference.Reference | Null.Null);
    static readonly id = 'DotExpression';
    static readonly implements = new Set([
        'DotExpression',
        'ion_Object',
        'Expression',
        'Typed',
        'Node'
    ]);
    constructor({location = null, type = null}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | (Reference.Reference | Null.Null)
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(TypeExpression.isTypeExpression(type) || (Reference.isReference(type) || Null.isNull(type))))
            throw new Error('type is not a TypeExpression | Reference | Null: ' + Class.toString(type));
        this.location = location;
        this.type = type;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | (Reference.Reference | Null.Null)
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