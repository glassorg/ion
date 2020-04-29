/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class ThisExpression {
    readonly location: Location.Location | Null.Null;
    constructor({
        location = null
    }: { location?: Location.Location | Null.Null }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        this.location = location;
    }
    static is(value): value is ThisExpression {
        return isThisExpression(value);
    }
}
ThisExpression['id'] = 'ThisExpression';
ThisExpression['implements'] = new Set([
    'ThisExpression',
    'Expression',
    'Node'
]);
export const isThisExpression = function (value): value is ThisExpression {
    return Class.isInstance(ThisExpression, value);
};