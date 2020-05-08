/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as Class from './ion/Class';
export class Id implements _Object.Object , Expression.Expression , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: Expression.Expression | Null.Null;
    readonly name: String.String;
    static readonly id = 'Id';
    static readonly implements = new Set([
        'Id',
        'ion_Object',
        'Expression',
        'Typed',
        'Node'
    ]);
    constructor({location = null, type = null, name}: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        name: String.String
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + Class.toString(type));
        if (!String.isString(name))
            throw new Error('name is not a String: ' + Class.toString(name));
        this.location = location;
        this.type = type;
        this.name = name;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
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