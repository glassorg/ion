/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Class from './ion/Class';
export class ConstrainedType implements _Object.Object , TypeExpression.TypeExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly baseType: Expression.Expression;
    readonly constraint: Expression.Expression;
    static readonly id = 'ConstrainedType';
    static readonly implements = new Set([
        'ConstrainedType',
        'ion_Object',
        'TypeExpression',
        'Expression',
        'Node'
    ]);
    constructor({location = null, baseType, constraint}: {
        location?: Location.Location | Null.Null,
        baseType: Expression.Expression,
        constraint: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Expression.isExpression(baseType))
            throw new Error('baseType is not a Expression: ' + Class.toString(baseType));
        if (!Expression.isExpression(constraint))
            throw new Error('constraint is not a Expression: ' + Class.toString(constraint));
        this.location = location;
        this.baseType = baseType;
        this.constraint = constraint;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        baseType?: Expression.Expression,
        constraint?: Expression.Expression
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