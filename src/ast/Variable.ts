/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Expression from './Expression';
import * as Id from './Id';
import * as Boolean from './ion/Boolean';
import * as Class from './ion/Class';
export class Variable implements _Object.Object , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: Expression.Expression | Null.Null;
    readonly id: Id.Id;
    readonly value: Expression.Expression | Null.Null;
    readonly assignable: Boolean.Boolean;
    static readonly id = 'Variable';
    static readonly implements = new Set([
        'Variable',
        'ion_Object',
        'Typed',
        'Node'
    ]);
    constructor({location = null, type = null, id, value = null, assignable = false}: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        id: Id.Id,
        value?: Expression.Expression | Null.Null,
        assignable?: Boolean.Boolean
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + type);
        if (!Id.isId(id))
            throw new Error('id is not a Id: ' + id);
        if (!(Expression.isExpression(value) || Null.isNull(value)))
            throw new Error('value is not a Expression | Null: ' + value);
        if (!Boolean.isBoolean(assignable))
            throw new Error('assignable is not a Boolean: ' + assignable);
        this.location = location;
        this.type = type;
        this.id = id;
        this.value = value;
        this.assignable = assignable;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        id?: Id.Id,
        value?: Expression.Expression | Null.Null,
        assignable?: Boolean.Boolean
    }) {
        return new Variable({
            ...this,
            ...properties
        });
    }
    static is(value): value is Variable {
        return isVariable(value);
    }
}
export function isVariable(value): value is Variable {
    return Class.isInstance(Variable, value);
}
export default Variable;