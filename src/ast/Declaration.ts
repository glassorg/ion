/*
This file was generated from ion source. Do not edit.
*/
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Id from './Id';
import * as Boolean from './ion/Boolean';
import * as Class from './ion/Class';
export class Declaration implements Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly id: Id.Id;
    readonly export: Boolean.Boolean;
    constructor({
        location = null,
        id,
        export: _export = false
    }: {
        location?: Location.Location | Null.Null,
        id: Id.Id,
        export?: Boolean.Boolean
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Id.isId(id))
            throw new Error('id is not a Id: ' + Class.toString(id));
        if (!Boolean.isBoolean(_export))
            throw new Error('export is not a Boolean: ' + Class.toString(_export));
        this.location = location;
        this.id = id;
        this.export = _export;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        id?: Id.Id,
        export?: Boolean.Boolean
    }) {
        return new Declaration({
            ...this,
            ...properties
        });
    }
    static is(value): value is Declaration {
        return isDeclaration(value);
    }
}
Declaration['id'] = 'Declaration';
Declaration['implements'] = new Set([
    'Declaration',
    'Node'
]);
export function isDeclaration(value): value is Declaration {
    return Class.isInstance(Declaration, value);
}
export default Declaration;