/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Typed from './Typed';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class Id implements _Object.Object , Expression.Expression , Node.Node , Typed.Typed {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly name: String.String;
    static readonly id = 'Id';
    static readonly implements = new Set([
        'Id',
        'ion_Object',
        'Expression',
        'Node',
        'Typed'
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
        return new Id({
            ...this,
            ...properties
        });
    }
    static is(value): value is Id {
        return isId(value);
    }
}
export function isId(value): value is Id {
    return Class.isInstance(Id, value);
}
export default Id;