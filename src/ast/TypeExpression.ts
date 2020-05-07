/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class TypeExpression implements Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    constructor({
        location = null
    }: { location?: Location.Location | Null.Null }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        this.location = location;
        Object.freeze(this);
    }
    patch(properties: { location?: Location.Location | Null.Null }) {
        return new TypeExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is TypeExpression {
        return isTypeExpression(value);
    }
}
TypeExpression['id'] = 'TypeExpression';
TypeExpression['implements'] = new Set([
    'TypeExpression',
    'Expression',
    'Node'
]);
export function isTypeExpression(value): value is TypeExpression {
    return Class.isInstance(TypeExpression, value);
}
export default TypeExpression;