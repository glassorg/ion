/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class MemberExpression implements Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly object: Expression.Expression;
    readonly property: Expression.Expression;
    constructor({location = null, object, property}: {
        location?: Location.Location | Null.Null,
        object: Expression.Expression,
        property: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!Expression.isExpression(object))
            throw new Error('object is not a Expression: ' + object);
        if (!Expression.isExpression(property))
            throw new Error('property is not a Expression: ' + property);
        this.location = location;
        this.object = object;
        this.property = property;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
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
MemberExpression['id'] = 'MemberExpression';
MemberExpression['implements'] = new Set([
    'MemberExpression',
    'Expression',
    'Node'
]);
export function isMemberExpression(value): value is MemberExpression {
    return Class.isInstance(MemberExpression, value);
}
export default MemberExpression;