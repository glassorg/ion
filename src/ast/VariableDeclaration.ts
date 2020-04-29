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
export class VariableDeclaration implements Variable.Variable , Declaration.Declaration , Node.Node , Node.Node {
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
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Id.isId(id))
            throw new Error('id is not a Id: ' + Class.toString(id));
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + Class.toString(type));
        if (!(Expression.isExpression(value) || Null.isNull(value)))
            throw new Error('value is not a Expression | Null: ' + Class.toString(value));
        if (!Boolean.isBoolean(assignable))
            throw new Error('assignable is not a Boolean: ' + Class.toString(assignable));
        if (!Boolean.isBoolean(_export))
            throw new Error('export is not a Boolean: ' + Class.toString(_export));
        this.location = location;
        this.id = id;
        this.type = type;
        this.value = value;
        this.assignable = assignable;
        this.export = _export;
        Object.freeze(this);
    }
    static is(value): value is VariableDeclaration {
        return isVariableDeclaration(value);
    }
}
VariableDeclaration['id'] = 'VariableDeclaration';
VariableDeclaration['implements'] = new Set([
    'VariableDeclaration',
    'Variable',
    'Declaration',
    'Node',
    'Node'
]);
export const isVariableDeclaration = function (value): value is VariableDeclaration {
    return Class.isInstance(VariableDeclaration, value);
};
export default VariableDeclaration;