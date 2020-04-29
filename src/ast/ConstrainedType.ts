/*
This file was generated from ion source. Do not edit.
*/
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Reference from './Reference';
import * as Class from './ion/Class';
export class ConstrainedType implements TypeExpression.TypeExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly baseType: Reference.Reference;
    readonly constraint: Expression.Expression;
    constructor({location = null, baseType, constraint}: {
        location?: Location.Location | Null.Null,
        baseType: Reference.Reference,
        constraint: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Reference.isReference(baseType))
            throw new Error('baseType is not a Reference: ' + Class.toString(baseType));
        if (!Expression.isExpression(constraint))
            throw new Error('constraint is not a Expression: ' + Class.toString(constraint));
        this.location = location;
        this.baseType = baseType;
        this.constraint = constraint;
        Object.freeze(this);
    }
    static is(value): value is ConstrainedType {
        return isConstrainedType(value);
    }
}
ConstrainedType['id'] = 'ConstrainedType';
ConstrainedType['implements'] = new Set([
    'ConstrainedType',
    'TypeExpression',
    'Expression',
    'Node'
]);
export const isConstrainedType = function (value): value is ConstrainedType {
    return Class.isInstance(ConstrainedType, value);
};
export default ConstrainedType;