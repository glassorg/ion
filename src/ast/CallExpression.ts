/*
This file was generated from ion source. Do not edit.
*/
import * as KeyValuePair from './KeyValuePair';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Boolean from './ion/Boolean';
import * as Array from './ion/Array';
import * as Class from './ion/Class';
export type Argument = KeyValuePair.KeyValuePair | Expression.Expression;
export function isArgument(value): value is Argument {
    return KeyValuePair.isKeyValuePair(value) || Expression.isExpression(value);
}
export class CallExpression {
    readonly location: Location.Location | Null.Null;
    readonly new: Boolean.Boolean;
    readonly callee: Expression.Expression;
    readonly arguments: Array.Array<Argument>;
    constructor({
        location = null,
        new: _new = false,
        callee,
        arguments: _arguments
    }: {
        location?: Location.Location | Null.Null,
        new?: Boolean.Boolean,
        callee: Expression.Expression,
        arguments: Array.Array<Argument>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Boolean.isBoolean(_new))
            throw new Error('new is not a Boolean: ' + Class.toString(_new));
        if (!Expression.isExpression(callee))
            throw new Error('callee is not a Expression: ' + Class.toString(callee));
        if (!Array.isArray(_arguments))
            throw new Error('arguments is not a Array: ' + Class.toString(_arguments));
        this.location = location;
        this.new = _new;
        this.callee = callee;
        this.arguments = _arguments;
        Object.freeze(this);
    }
    static is(value): value is CallExpression {
        return isCallExpression(value);
    }
}
CallExpression['id'] = 'CallExpression';
CallExpression['implements'] = new Set([
    'CallExpression',
    'Expression',
    'Node'
]);
export const isCallExpression = function (value): value is CallExpression {
    return Class.isInstance(CallExpression, value);
};
export default CallExpression;