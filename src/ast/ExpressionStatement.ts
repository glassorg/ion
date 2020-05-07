/*
This file was generated from ion source. Do not edit.
*/
import * as Statement from './Statement';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Expression from './Expression';
import * as Class from './ion/Class';
export class ExpressionStatement implements Statement.Statement , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly value: Expression.Expression;
    constructor({location = null, value}: {
        location?: Location.Location | Null.Null,
        value: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!Expression.isExpression(value))
            throw new Error('value is not a Expression: ' + value);
        this.location = location;
        this.value = value;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        value?: Expression.Expression
    }) {
        return new ExpressionStatement({
            ...this,
            ...properties
        });
    }
    static is(value): value is ExpressionStatement {
        return isExpressionStatement(value);
    }
}
ExpressionStatement['id'] = 'ExpressionStatement';
ExpressionStatement['implements'] = new Set([
    'ExpressionStatement',
    'Statement',
    'Node'
]);
export function isExpressionStatement(value): value is ExpressionStatement {
    return Class.isInstance(ExpressionStatement, value);
}
export default ExpressionStatement;