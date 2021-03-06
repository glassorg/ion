/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class Node implements _Object.Object {
    readonly location: Location.Location | Null.Null;
    static readonly id = 'Node';
    static readonly implements = new Set([
        'Node',
        'ion_Object'
    ]);
    constructor({
        location = null
    }: { location?: Location.Location | Null.Null }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        this.location = location;
        Object.freeze(this);
    }
    patch(properties: { location?: Location.Location | Null.Null }) {
        return new Node({
            ...this,
            ...properties
        });
    }
    static is(value): value is Node {
        return isNode(value);
    }
}
export function isNode(value): value is Node {
    return Class.isInstance(Node, value);
}
export default Node;