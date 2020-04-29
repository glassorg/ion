/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class Id {
    readonly location: Location.Location | Null.Null;
    readonly name: String.String;
    constructor({location = null, name}: {
        location?: Location.Location | Null.Null,
        name: String.String
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!String.isString(name))
            throw new Error('name is not a String: ' + Class.toString(name));
        this.location = location;
        this.name = name;
    }
    static is(value): value is Id {
        return isId(value);
    }
}
Id['id'] = 'Id';
Id['implements'] = new Set([
    'Id',
    'Expression',
    'Node'
]);
export const isId = function (value): value is Id {
    return Class.isInstance(Id, value);
};
export default Id;