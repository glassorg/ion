/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Reference from './Reference';
import * as TypeExpression from './TypeExpression';
import * as Id from './Id';
import * as Expression from './Expression';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class TypeReference implements _Object.Object , Reference.Reference , TypeExpression.TypeExpression , Id.Id , Expression.Expression , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: Expression.Expression | Null.Null;
    readonly name: String.String;
    readonly original: TypeExpression.TypeExpression | Null.Null;
    static readonly id = 'TypeReference';
    static readonly implements = new Set([
        'TypeReference',
        'ion_Object',
        'Reference',
        'TypeExpression',
        'Id',
        'Expression',
        'Typed',
        'Node'
    ]);
    constructor({location = null, type = null, name, original = null}: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        name: String.String,
        original?: TypeExpression.TypeExpression | Null.Null
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + type);
        if (!String.isString(name))
            throw new Error('name is not a String: ' + name);
        if (!(TypeExpression.isTypeExpression(original) || Null.isNull(original)))
            throw new Error('original is not a TypeExpression | Null: ' + original);
        this.location = location;
        this.type = type;
        this.name = name;
        this.original = original;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        name?: String.String,
        original?: TypeExpression.TypeExpression | Null.Null
    }) {
        return new TypeReference({
            ...this,
            ...properties
        });
    }
    static is(value): value is TypeReference {
        return isTypeReference(value);
    }
}
export function isTypeReference(value): value is TypeReference {
    return Class.isInstance(TypeReference, value);
}
export default TypeReference;