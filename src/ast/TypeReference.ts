/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Reference from './Reference';
import * as Id from './Id';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Typed from './Typed';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class TypeReference implements _Object.Object , Reference.Reference , Id.Id , Expression.Expression , Node.Node , Typed.Typed {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly name: String.String;
    readonly original: TypeExpression.TypeExpression;
    static readonly id = 'TypeReference';
    static readonly implements = new Set([
        'TypeReference',
        'ion_Object',
        'Reference',
        'Id',
        'Expression',
        'Node',
        'Typed'
    ]);
    constructor({location = null, type = null, name, original}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        name: String.String,
        original: TypeExpression.TypeExpression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        if (!String.isString(name))
            throw new Error('name is not a String: ' + name);
        if (!TypeExpression.isTypeExpression(original))
            throw new Error('original is not a TypeExpression: ' + original);
        this.location = location;
        this.type = type;
        this.name = name;
        this.original = original;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        name?: String.String,
        original?: TypeExpression.TypeExpression
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