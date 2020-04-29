/*
This file was generated from ion source. Do not edit.
*/
import * as Id from './Id';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class Reference {
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
    static is(value): value is Reference {
        return isReference(value);
    }
}
Reference['id'] = 'Reference';
Reference['implements'] = new Set([
    'Reference',
    'Id',
    'Expression',
    'Node'
]);
export const isReference = function (value): value is Reference {
    return Class.isInstance(Reference, value);
};