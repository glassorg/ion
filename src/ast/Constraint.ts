/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as _Array from './ion/Array';
import * as Id from './Id';
import * as String from './ion/String';
import * as Literal from './Literal';
import * as Reference from './Reference';
import * as FunctionType from './FunctionType';
import * as Expression from './Expression';
import * as Class from './ion/Class';
export class Constraint implements _Object.Object , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly left: _Array.Array<Id.Id>;
    readonly operator: String.String;
    readonly right: Literal.Literal | (Reference.Reference | (FunctionType.FunctionType | Expression.Expression));
    static readonly id = 'Constraint';
    static readonly implements = new Set([
        'Constraint',
        'ion_Object',
        'Node'
    ]);
    constructor({location = null, left, operator, right}: {
        location?: Location.Location | Null.Null,
        left: _Array.Array<Id.Id>,
        operator: String.String,
        right: Literal.Literal | (Reference.Reference | (FunctionType.FunctionType | Expression.Expression))
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!_Array.isArray(left))
            throw new Error('left is not a Array: ' + Class.toString(left));
        if (!String.isString(operator))
            throw new Error('operator is not a String: ' + Class.toString(operator));
        if (!(Literal.isLiteral(right) || (Reference.isReference(right) || (FunctionType.isFunctionType(right) || Expression.isExpression(right)))))
            throw new Error('right is not a Literal | Reference | FunctionType | Expression: ' + Class.toString(right));
        this.location = location;
        this.left = left;
        this.operator = operator;
        this.right = right;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        left?: _Array.Array<Id.Id>,
        operator?: String.String,
        right?: Literal.Literal | (Reference.Reference | (FunctionType.FunctionType | Expression.Expression))
    }) {
        return new Constraint({
            ...this,
            ...properties
        });
    }
    static is(value): value is Constraint {
        return isConstraint(value);
    }
}
export function isConstraint(value): value is Constraint {
    return Class.isInstance(Constraint, value);
}
export default Constraint;