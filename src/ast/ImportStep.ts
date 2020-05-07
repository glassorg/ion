/*
This file was generated from ion source. Do not edit.
*/
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Boolean from './ion/Boolean';
import * as Id from './Id';
import * as Array from './ion/Array';
import * as Class from './ion/Class';
export class ImportStep implements Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly relative: Boolean.Boolean;
    readonly id: Id.Id | Null.Null;
    readonly as: Id.Id | Null.Null;
    readonly children: Array.Array<ImportStep> | Boolean.Boolean;
    constructor({location = null, relative, id = null, as = null, children}: {
        location?: Location.Location | Null.Null,
        relative: Boolean.Boolean,
        id?: Id.Id | Null.Null,
        as?: Id.Id | Null.Null,
        children: Array.Array<ImportStep> | Boolean.Boolean
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!Boolean.isBoolean(relative))
            throw new Error('relative is not a Boolean: ' + relative);
        if (!(Id.isId(id) || Null.isNull(id)))
            throw new Error('id is not a Id | Null: ' + id);
        if (!(Id.isId(as) || Null.isNull(as)))
            throw new Error('as is not a Id | Null: ' + as);
        if (!(Array.isArray(children) || Boolean.isBoolean(children)))
            throw new Error('children is not a Array | Boolean: ' + children);
        this.location = location;
        this.relative = relative;
        this.id = id;
        this.as = as;
        this.children = children;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        relative?: Boolean.Boolean,
        id?: Id.Id | Null.Null,
        as?: Id.Id | Null.Null,
        children?: Array.Array<ImportStep> | Boolean.Boolean
    }) {
        return new ImportStep({
            ...this,
            ...properties
        });
    }
    static is(value): value is ImportStep {
        return isImportStep(value);
    }
}
ImportStep['id'] = 'ImportStep';
ImportStep['implements'] = new Set([
    'ImportStep',
    'Node'
]);
export function isImportStep(value): value is ImportStep {
    return Class.isInstance(ImportStep, value);
}
export default ImportStep;