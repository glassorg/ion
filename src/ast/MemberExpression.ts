/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class MemberExpression implements _Object.Object , Expression.Expression , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: Expression.Expression | Null.Null;
    readonly object: Expression.Expression;
    readonly property: Expression.Expression;
    static readonly id = 'MemberExpression';
    static readonly implements = new Set([
        'MemberExpression',
        'ion_Object',
        'Expression',
        'Typed',
        'Node'
    ]);
    constructor({location = null, type = null, object, property}: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        object: Expression.Expression,
        property: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + Class.toString(type));
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
        type?: Expression.Expression | Null.Null,
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