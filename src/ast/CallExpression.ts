/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as Reference from './Reference';
import * as _Array from './ion/Array';
import * as Argument from './Argument';
import * as Class from './ion/Class';
export class CallExpression implements _Object.Object , Expression.Expression , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | (Reference.Reference | Null.Null);
    readonly callee: Expression.Expression;
    readonly arguments: _Array.Array<Argument.Argument>;
    static readonly id = 'CallExpression';
    static readonly implements = new Set([
        'CallExpression',
        'ion_Object',
        'Expression',
        'Typed',
        'Node'
    ]);
    constructor({
        location = null,
        type = null,
        callee,
        arguments: _arguments
    }: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | (Reference.Reference | Null.Null),
        callee: Expression.Expression,
        arguments: _Array.Array<Argument.Argument>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(TypeExpression.isTypeExpression(type) || (Reference.isReference(type) || Null.isNull(type))))
            throw new Error('type is not a TypeExpression | Reference | Null: ' + Class.toString(type));
        if (!Expression.isExpression(callee))
            throw new Error('callee is not a Expression: ' + Class.toString(callee));
        if (!_Array.isArray(_arguments))
            throw new Error('arguments is not a Array: ' + Class.toString(_arguments));
        this.location = location;
        this.type = type;
        this.callee = callee;
        this.arguments = _arguments;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | (Reference.Reference | Null.Null),
        callee?: Expression.Expression,
        arguments?: _Array.Array<Argument.Argument>
    }) {
        return new CallExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is CallExpression {
        return isCallExpression(value);
    }
}
export function isCallExpression(value): value is CallExpression {
    return Class.isInstance(CallExpression, value);
}
export default CallExpression;