/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Literal from './Literal';
import * as Class from './ion/Class';
export class LiteralType implements _Object.Object , TypeExpression.TypeExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly literal: Literal.Literal;
    static readonly id = 'LiteralType';
    static readonly implements = new Set([
        'LiteralType',
        'ion_Object',
        'TypeExpression',
        'Expression',
        'Node'
    ]);
    constructor({location = null, type = null, literal}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        literal: Literal.Literal
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        if (!Literal.isLiteral(literal))
            throw new Error('literal is not a Literal: ' + literal);
        this.location = location;
        this.type = type;
        this.literal = literal;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
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
export function isLiteralType(value): value is LiteralType {
    return Class.isInstance(LiteralType, value);
}
export default LiteralType;