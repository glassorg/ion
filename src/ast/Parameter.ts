/*
This file was generated from ion source. Do not edit.
*/
import * as Variable from './Variable';
import * as Declaration from './Declaration';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Id from './Id';
import * as Expression from './Expression';
import * as Boolean from './ion/Boolean';
import * as Class from './ion/Class';
export class Parameter implements Variable.Variable , Declaration.Declaration , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly id: Id.Id;
    readonly type: Expression.Expression | Null.Null;
    readonly value: Expression.Expression | Null.Null;
    readonly assignable: Boolean.Boolean;
    readonly export: Boolean.Boolean;
    constructor({
        location = null,
        id,
        type = null,
        value = null,
        assignable = false,
        export: _export = false
    }: {
        location?: Location.Location | Null.Null,
        id: Id.Id,
        type?: Expression.Expression | Null.Null,
        value?: Expression.Expression | Null.Null,
        assignable?: Boolean.Boolean,
        export?: Boolean.Boolean
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!Id.isId(id))
            throw new Error('id is not a Id: ' + id);
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + type);
        if (!(Expression.isExpression(value) || Null.isNull(value)))
            throw new Error('value is not a Expression | Null: ' + value);
        if (!Boolean.isBoolean(assignable))
            throw new Error('assignable is not a Boolean: ' + assignable);
        if (!Boolean.isBoolean(_export))
            throw new Error('export is not a Boolean: ' + _export);
        this.location = location;
        this.id = id;
        this.type = type;
        this.value = value;
        this.assignable = assignable;
        this.export = _export;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        id?: Id.Id,
        type?: Expression.Expression | Null.Null,
        value?: Expression.Expression | Null.Null,
        assignable?: Boolean.Boolean,
        export?: Boolean.Boolean
    }) {
        return new Parameter({
            ...this,
            ...properties
        });
    }
    static is(value): value is Parameter {
        return isParameter(value);
    }
}
Parameter['id'] = 'Parameter';
Parameter['implements'] = new Set([
    'Parameter',
    'Variable',
    'Declaration',
    'Node'
]);
export function isParameter(value): value is Parameter {
    return Class.isInstance(Parameter, value);
}
export default Parameter;