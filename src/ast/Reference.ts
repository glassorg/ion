/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Id from './Id';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class Reference implements _Object.Object , Id.Id , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly name: String.String;
    static readonly id = 'Reference';
    static readonly implements = new Set([
        'Reference',
        'ion_Object',
        'Id',
        'Expression',
        'Node'
    ]);
    constructor({location = null, type = null, name}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        name: String.String
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        if (!String.isString(name))
            throw new Error('name is not a String: ' + name);
        this.location = location;
        this.type = type;
        this.name = name;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        name?: String.String
    }) {
        return new Reference({
            ...this,
            ...properties
        });
    }
    static is(value): value is Reference {
        return isReference(value);
    }
}
export function isReference(value): value is Reference {
    return Class.isInstance(Reference, value);
}
export default Reference;