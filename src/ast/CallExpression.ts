/*
This file was generated from ion source. Do not edit.
*/
import * as KeyValuePair from './KeyValuePair';
import * as Expression from './Expression';
import * as _Object from './ion/Object';
import * as Node from './Node';
import * as Typed from './Typed';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as Boolean from './ion/Boolean';
import * as _Array from './ion/Array';
import * as Class from './ion/Class';
export type Argument = KeyValuePair.KeyValuePair | Expression.Expression;
export function isArgument(value): value is Argument {
    return KeyValuePair.isKeyValuePair(value) || Expression.isExpression(value);
}
export class CallExpression implements _Object.Object , Expression.Expression , Node.Node , Typed.Typed {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly new: Boolean.Boolean;
    readonly callee: Expression.Expression;
    readonly arguments: _Array.Array<Argument>;
    static readonly id = 'CallExpression';
    static readonly implements = new Set([
        'CallExpression',
        'ion_Object',
        'Expression',
        'Node',
        'Typed'
    ]);
    constructor({
        location = null,
        type = null,
        new: _new = false,
        callee,
        arguments: _arguments
    }: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        new?: Boolean.Boolean,
        callee: Expression.Expression,
        arguments: _Array.Array<Argument>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + Class.toString(type));
        if (!Boolean.isBoolean(_new))
            throw new Error('new is not a Boolean: ' + Class.toString(_new));
        if (!Expression.isExpression(callee))
            throw new Error('callee is not a Expression: ' + Class.toString(callee));
        if (!_Array.isArray(_arguments))
            throw new Error('arguments is not a Array: ' + Class.toString(_arguments));
        this.location = location;
        this.type = type;
        this.new = _new;
        this.callee = callee;
        this.arguments = _arguments;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        new?: Boolean.Boolean,
        callee?: Expression.Expression,
        arguments?: _Array.Array<Argument>
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