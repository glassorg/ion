/*
This file was generated from ion source. Do not edit.
*/
import * as Reference from './Reference';
import * as Id from './Id';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as TypeExpression from './TypeExpression';
import * as Class from './ion/Class';
export class TypeReference implements Reference.Reference , Id.Id , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly name: String.String;
    readonly original: TypeExpression.TypeExpression;
    constructor({location = null, name, original}: {
        location?: Location.Location | Null.Null,
        name: String.String,
        original: TypeExpression.TypeExpression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!String.isString(name))
            throw new Error('name is not a String: ' + name);
        if (!TypeExpression.isTypeExpression(original))
            throw new Error('original is not a TypeExpression: ' + original);
        this.location = location;
        this.name = name;
        this.original = original;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
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
TypeReference['id'] = 'TypeReference';
TypeReference['implements'] = new Set([
    'TypeReference',
    'Reference',
    'Id',
    'Expression',
    'Node'
]);
export function isTypeReference(value): value is TypeReference {
    return Class.isInstance(TypeReference, value);
}
export default TypeReference;