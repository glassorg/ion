/*
This file was generated from ion source. Do not edit.
*/
import * as Declaration from './Declaration';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Id from './Id';
import * as Boolean from './ion/Boolean';
import * as Array from './ion/Array';
import * as Parameter from './Parameter';
import * as Reference from './Reference';
import * as KeyValuePair from './KeyValuePair';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class ClassDeclaration implements Declaration.Declaration , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly id: Id.Id;
    readonly export: Boolean.Boolean;
    readonly isStructure: Boolean.Boolean;
    readonly parameters: Array.Array<Parameter.Parameter>;
    readonly baseClasses: Array.Array<Reference.Reference>;
    readonly declarations: Array.Array<Declaration.Declaration>;
    readonly meta: Array.Array<KeyValuePair.KeyValuePair>;
    readonly _implements: Array.Array<String.String>;
    constructor({
        location = null,
        id,
        export: _export = false,
        isStructure = false,
        parameters = [],
        baseClasses = [],
        declarations,
        meta = [],
        _implements = []
    }: {
        location?: Location.Location | Null.Null,
        id: Id.Id,
        export?: Boolean.Boolean,
        isStructure?: Boolean.Boolean,
        parameters?: Array.Array<Parameter.Parameter>,
        baseClasses?: Array.Array<Reference.Reference>,
        declarations: Array.Array<Declaration.Declaration>,
        meta?: Array.Array<KeyValuePair.KeyValuePair>,
        _implements?: Array.Array<String.String>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!Id.isId(id))
            throw new Error('id is not a Id: ' + id);
        if (!Boolean.isBoolean(_export))
            throw new Error('export is not a Boolean: ' + _export);
        if (!Boolean.isBoolean(isStructure))
            throw new Error('isStructure is not a Boolean: ' + isStructure);
        if (!Array.isArray(parameters))
            throw new Error('parameters is not a Array: ' + parameters);
        if (!Array.isArray(baseClasses))
            throw new Error('baseClasses is not a Array: ' + baseClasses);
        if (!Array.isArray(declarations))
            throw new Error('declarations is not a Array: ' + declarations);
        if (!Array.isArray(meta))
            throw new Error('meta is not a Array: ' + meta);
        if (!Array.isArray(_implements))
            throw new Error('_implements is not a Array: ' + _implements);
        this.location = location;
        this.id = id;
        this.export = _export;
        this.isStructure = isStructure;
        this.parameters = parameters;
        this.baseClasses = baseClasses;
        this.declarations = declarations;
        this.meta = meta;
        this._implements = _implements;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        id?: Id.Id,
        export?: Boolean.Boolean,
        isStructure?: Boolean.Boolean,
        parameters?: Array.Array<Parameter.Parameter>,
        baseClasses?: Array.Array<Reference.Reference>,
        declarations?: Array.Array<Declaration.Declaration>,
        meta?: Array.Array<KeyValuePair.KeyValuePair>,
        _implements?: Array.Array<String.String>
    }) {
        return new ClassDeclaration({
            ...this,
            ...properties
        });
    }
    static is(value): value is ClassDeclaration {
        return isClassDeclaration(value);
    }
}
ClassDeclaration['id'] = 'ClassDeclaration';
ClassDeclaration['implements'] = new Set([
    'ClassDeclaration',
    'Declaration',
    'Node'
]);
export function isClassDeclaration(value): value is ClassDeclaration {
    return Class.isInstance(ClassDeclaration, value);
}
export default ClassDeclaration;