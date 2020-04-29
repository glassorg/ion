/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class Literal {
    readonly location: Location.Location | Null.Null;
    constructor({
        location = null
    }: { location?: Location.Location | Null.Null }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        this.location = location;
        Object.freeze(this);
    }
    static is(value): value is Literal {
        return isLiteral(value);
    }
}
Literal['id'] = 'Literal';
Literal['implements'] = new Set([
    'Literal',
    'Expression',
    'Node'
]);
export const isLiteral = function (value): value is Literal {
    return Class.isInstance(Literal, value);
};
export default Literal;