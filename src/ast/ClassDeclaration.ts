/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Declaration from './Declaration';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as Reference from './Reference';
import * as Id from './Id';
import * as Boolean from './ion/Boolean';
import * as _Array from './ion/Array';
import * as Parameter from './Parameter';
import * as Map from './ion/Map';
import * as String from './ion/String';
import * as KeyValuePair from './KeyValuePair';
import * as Class from './ion/Class';
export class ClassDeclaration implements _Object.Object , Declaration.Declaration , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | (Reference.Reference | Null.Null);
    readonly id: Id.Id;
    readonly export: Boolean.Boolean;
    readonly isStructure: Boolean.Boolean;
    readonly parameters: _Array.Array<Parameter.Parameter>;
    readonly baseClasses: _Array.Array<Reference.Reference>;
    readonly declarations: Map.Map<String.String, Declaration.Declaration>;
    readonly meta: _Array.Array<KeyValuePair.KeyValuePair>;
    static readonly id = 'ClassDeclaration';
    static readonly implements = new Set([
        'ClassDeclaration',
        'ion_Object',
        'Declaration',
        'Typed',
        'Node'
    ]);
    constructor({
        location = null,
        type = null,
        id,
        export: _export = false,
        isStructure = false,
        parameters = [],
        baseClasses = [],
        declarations,
        meta = []
    }: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | (Reference.Reference | Null.Null),
        id: Id.Id,
        export?: Boolean.Boolean,
        isStructure?: Boolean.Boolean,
        parameters?: _Array.Array<Parameter.Parameter>,
        baseClasses?: _Array.Array<Reference.Reference>,
        declarations: Map.Map<String.String, Declaration.Declaration>,
        meta?: _Array.Array<KeyValuePair.KeyValuePair>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(TypeExpression.isTypeExpression(type) || (Reference.isReference(type) || Null.isNull(type))))
            throw new Error('type is not a TypeExpression | Reference | Null: ' + Class.toString(type));
        if (!Id.isId(id))
            throw new Error('id is not a Id: ' + Class.toString(id));
        if (!Boolean.isBoolean(_export))
            throw new Error('export is not a Boolean: ' + Class.toString(_export));
        if (!Boolean.isBoolean(isStructure))
            throw new Error('isStructure is not a Boolean: ' + Class.toString(isStructure));
        if (!_Array.isArray(parameters))
            throw new Error('parameters is not a Array: ' + Class.toString(parameters));
        if (!_Array.isArray(baseClasses))
            throw new Error('baseClasses is not a Array: ' + Class.toString(baseClasses));
        if (!Map.isMap(declarations))
            throw new Error('declarations is not a Map: ' + Class.toString(declarations));
        if (!_Array.isArray(meta))
            throw new Error('meta is not a Array: ' + Class.toString(meta));
        this.location = location;
        this.type = type;
        this.id = id;
        this.export = _export;
        this.isStructure = isStructure;
        this.parameters = parameters;
        this.baseClasses = baseClasses;
        this.declarations = declarations;
        this.meta = meta;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | (Reference.Reference | Null.Null),
        id?: Id.Id,
        export?: Boolean.Boolean,
        isStructure?: Boolean.Boolean,
        parameters?: _Array.Array<Parameter.Parameter>,
        baseClasses?: _Array.Array<Reference.Reference>,
        declarations?: Map.Map<String.String, Declaration.Declaration>,
        meta?: _Array.Array<KeyValuePair.KeyValuePair>
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
export function isClassDeclaration(value): value is ClassDeclaration {
    return Class.isInstance(ClassDeclaration, value);
}
export default ClassDeclaration;