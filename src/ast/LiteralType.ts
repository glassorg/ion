/*
This file was generated from ion source. Do not edit.
*/
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Literal from './Literal';
import * as Class from './ion/Class';
export class LiteralType implements TypeExpression.TypeExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly literal: Literal.Literal;
    constructor({location = null, literal}: {
        location?: Location.Location | Null.Null,
        literal: Literal.Literal
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Literal.isLiteral(literal))
            throw new Error('literal is not a Literal: ' + Class.toString(literal));
        this.location = location;
        this.literal = literal;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        literal?: Literal.Literal
    }) {
        return new LiteralType({
            ...this,
            ...properties
        });
    }
    static is(value): value is LiteralType {
        return isLiteralType(value);
    }
}
LiteralType['id'] = 'LiteralType';
LiteralType['implements'] = new Set([
    'LiteralType',
    'TypeExpression',
    'Expression',
    'Node'
]);
export const isLiteralType = function (value): value is LiteralType {
    return Class.isInstance(LiteralType, value);
};
export default LiteralType;