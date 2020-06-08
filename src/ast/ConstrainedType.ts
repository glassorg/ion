/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as _Array from './ion/Array';
import * as Constraint from './Constraint';
import * as Class from './ion/Class';
export class ConstrainedType implements _Object.Object , TypeExpression.TypeExpression , Expression.Expression , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: Expression.Expression | Null.Null;
    readonly constraints: _Array.Array<Constraint.Constraint>;
    static readonly id = 'ConstrainedType';
    static readonly implements = new Set([
        'ConstrainedType',
        'ion_Object',
        'TypeExpression',
        'Expression',
        'Typed',
        'Node'
    ]);
    constructor({location = null, type = null, constraints}: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        constraints: _Array.Array<Constraint.Constraint>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + Class.toString(type));
        if (!_Array.isArray(constraints))
            throw new Error('constraints is not a Array: ' + Class.toString(constraints));
        this.location = location;
        this.type = type;
        this.constraints = constraints;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        constraints?: _Array.Array<Constraint.Constraint>
    }) {
        return new ConstrainedType({
            ...this,
            ...properties
        });
    }
    static is(value): value is ConstrainedType {
        return isConstrainedType(value);
    }
}
export function isConstrainedType(value): value is ConstrainedType {
    return Class.isInstance(ConstrainedType, value);
}
export default ConstrainedType;