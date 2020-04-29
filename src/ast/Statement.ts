/*
This file was generated from ion source. Do not edit.
*/
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class Statement implements Node.Node {
    readonly location: Location.Location | Null.Null;
    constructor({
        location = null
    }: { location?: Location.Location | Null.Null }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        this.location = location;
        Object.freeze(this);
    }
    static is(value): value is Statement {
        return isStatement(value);
    }
}
Statement['id'] = 'Statement';
Statement['implements'] = new Set([
    'Statement',
    'Node'
]);
export const isStatement = function (value): value is Statement {
    return Class.isInstance(Statement, value);
};
export default Statement;