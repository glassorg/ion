/*
This file was generated from ion source. Do not edit.
*/
import * as Declaration from './Declaration';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Id from './Id';
import * as Boolean from './ion/Boolean';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class ImportDeclaration implements Declaration.Declaration , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly id: Id.Id;
    readonly export: Boolean.Boolean;
    readonly from: String.String;
    constructor({
        location = null,
        id,
        export: _export = false,
        from
    }: {
        location?: Location.Location | Null.Null,
        id: Id.Id,
        export?: Boolean.Boolean,
        from: String.String
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Id.isId(id))
            throw new Error('id is not a Id: ' + Class.toString(id));
        if (!Boolean.isBoolean(_export))
            throw new Error('export is not a Boolean: ' + Class.toString(_export));
        if (!String.isString(from))
            throw new Error('from is not a String: ' + Class.toString(from));
        this.location = location;
        this.id = id;
        this.export = _export;
        this.from = from;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        id?: Id.Id,
        export?: Boolean.Boolean,
        from?: String.String
    }) {
        return new ImportDeclaration({
            ...this,
            ...properties
        });
    }
    static is(value): value is ImportDeclaration {
        return isImportDeclaration(value);
    }
}
ImportDeclaration['id'] = 'ImportDeclaration';
ImportDeclaration['implements'] = new Set([
    'ImportDeclaration',
    'Declaration',
    'Node'
]);
export function isImportDeclaration(value): value is ImportDeclaration {
    return Class.isInstance(ImportDeclaration, value);
}
export default ImportDeclaration;