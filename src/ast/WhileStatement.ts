/*
This file was generated from ion source. Do not edit.
*/
import * as Statement from './Statement';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Expression from './Expression';
import * as BlockStatement from './BlockStatement';
import * as Class from './ion/Class';
export class WhileStatement implements Statement.Statement , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly test: Expression.Expression;
    readonly body: BlockStatement.BlockStatement;
    constructor({location = null, test, body}: {
        location?: Location.Location | Null.Null,
        test: Expression.Expression,
        body: BlockStatement.BlockStatement
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Expression.isExpression(test))
            throw new Error('test is not a Expression: ' + Class.toString(test));
        if (!BlockStatement.isBlockStatement(body))
            throw new Error('body is not a BlockStatement: ' + Class.toString(body));
        this.location = location;
        this.test = test;
        this.body = body;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        test?: Expression.Expression,
        body?: BlockStatement.BlockStatement
    }) {
        return new WhileStatement({
            ...this,
            ...properties
        });
    }
    static is(value): value is WhileStatement {
        return isWhileStatement(value);
    }
}
WhileStatement['id'] = 'WhileStatement';
WhileStatement['implements'] = new Set([
    'WhileStatement',
    'Statement',
    'Node'
]);
export const isWhileStatement = function (value): value is WhileStatement {
    return Class.isInstance(WhileStatement, value);
};
export default WhileStatement;