/*
This file was generated from ion source. Do not edit.
*/
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Expression from './Expression';
import * as Id from './Id';
import * as Class from './ion/Class';
export class KeyValuePair implements Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly key: Expression.Expression | Id.Id;
    readonly value: Expression.Expression;
    constructor({location = null, key, value}: {
        location?: Location.Location | Null.Null,
        key: Expression.Expression | Id.Id,
        value: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(Expression.isExpression(key) || Id.isId(key)))
            throw new Error('key is not a Expression | Id: ' + key);
        if (!Expression.isExpression(value))
            throw new Error('value is not a Expression: ' + value);
        this.location = location;
        this.key = key;
        this.value = value;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        key?: Expression.Expression | Id.Id,
        value?: Expression.Expression
    }) {
        return new KeyValuePair({
            ...this,
            ...properties
        });
    }
    static is(value): value is KeyValuePair {
        return isKeyValuePair(value);
    }
}
KeyValuePair['id'] = 'KeyValuePair';
KeyValuePair['implements'] = new Set([
    'KeyValuePair',
    'Node'
]);
export function isKeyValuePair(value): value is KeyValuePair {
    return Class.isInstance(KeyValuePair, value);
}
export default KeyValuePair;