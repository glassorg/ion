/*
This file was generated from ion source. Do not edit.
*/
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class Expression implements Node.Node {
    readonly location: Location.Location | Null.Null;
    constructor({
        location = null
    }: { location?: Location.Location | Null.Null }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        this.location = location;
        Object.freeze(this);
    }
    patch(properties: { location?: Location.Location | Null.Null }) {
        return new Expression({
            ...this,
            ...properties
        });
    }
    static is(value): value is Expression {
        return isExpression(value);
    }
}
Expression['id'] = 'Expression';
Expression['implements'] = new Set([
    'Expression',
    'Node'
]);
export const isExpression = function (value): value is Expression {
    return Class.isInstance(Expression, value);
};
export default Expression;