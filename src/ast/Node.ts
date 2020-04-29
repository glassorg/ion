/*
This file was generated from ion source. Do not edit.
*/
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class Node {
    readonly location: Location.Location | Null.Null;
    constructor({
        location = null
    }: { location?: Location.Location | Null.Null }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        this.location = location;
    }
    static is(value): value is Node {
        return isNode(value);
    }
}
Node['id'] = 'Node';
Node['implements'] = new Set(['Node']);
export const isNode = function (value): value is Node {
    return Class.isInstance(Node, value);
};
export default Node;