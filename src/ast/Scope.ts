/*
This file was generated from ion source. Do not edit.
*/
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class Scope {
    readonly location: Location.Location | Null.Null;
    constructor({
        location = null
    }: { location?: Location.Location | Null.Null }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        this.location = location;
        Object.freeze(this);
    }
    static is(value): value is Scope {
        return isScope(value);
    }
}
Scope['id'] = 'Scope';
Scope['implements'] = new Set([
    'Scope',
    'Node'
]);
export const isScope = function (value): value is Scope {
    return Class.isInstance(Scope, value);
};
export default Scope;