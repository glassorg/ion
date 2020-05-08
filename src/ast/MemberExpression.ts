/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Typed from './Typed';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as Class from './ion/Class';
export class MemberExpression implements _Object.Object , Expression.Expression , Node.Node , Typed.Typed {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly object: Expression.Expression;
    readonly property: Expression.Expression;
    static readonly id = 'MemberExpression';
    static readonly implements = new Set([
        'MemberExpression',
        'ion_Object',
        'Expression',
        'Node',
        'Typed'
    ]);
    constructor({location = null, type = null, object, property}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        object: Expression.Expression,
        property: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + Class.toString(type));
        if (!Expression.isExpression(object))
            throw new Error('object is not a Expression: ' + Class.toString(object));
        if (!Expression.isExpression(property))
            throw new Error('property is not a Expression: ' + Class.toString(property));
        this.location = location;
        this.type = type;
        this.object = object;
        this.property = property;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        object?: Expression.Expression,
        property?: Expression.Expression
    }) {
        return new MemberExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is MemberExpression {
        return isMemberExpression(value);
    }
}
export function isMemberExpression(value): value is MemberExpression {
    return Class.isInstance(MemberExpression, value);
}
export default MemberExpression;