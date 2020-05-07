/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class DotExpression implements Expression.Expression , Node.Node {
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
        return new DotExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is DotExpression {
        return isDotExpression(value);
    }
}
DotExpression['id'] = 'DotExpression';
DotExpression['implements'] = new Set([
    'DotExpression',
    'Expression',
    'Node'
]);
export function isDotExpression(value): value is DotExpression {
    return Class.isInstance(DotExpression, value);
}
export default DotExpression;