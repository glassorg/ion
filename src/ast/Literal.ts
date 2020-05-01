/*
This file was generated from ion source. Do not edit.
*/
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as String from './ion/String';
import * as Number from './ion/Number';
import * as Boolean from './ion/Boolean';
import * as Class from './ion/Class';
export class Literal implements Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly value: String.String | (Number.Number | (Boolean.Boolean | Null.Null));
    constructor({location = null, value}: {
        location?: Location.Location | Null.Null,
        value: String.String | (Number.Number | (Boolean.Boolean | Null.Null))
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(String.isString(value) || (Number.isNumber(value) || (Boolean.isBoolean(value) || Null.isNull(value)))))
            throw new Error('value is not a String | Number | Boolean | Null: ' + Class.toString(value));
        this.location = location;
        this.value = value;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        value?: String.String | (Number.Number | (Boolean.Boolean | Null.Null))
    }) {
        return new Literal({
            ...this,
            ...properties
        });
    }
    static is(value): value is Literal {
        return isLiteral(value);
    }
}
Literal['id'] = 'Literal';
Literal['implements'] = new Set([
    'Literal',
    'Expression',
    'Node'
]);
export const isLiteral = function (value): value is Literal {
    return Class.isInstance(Literal, value);
};
export default Literal;