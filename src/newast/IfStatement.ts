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
export class IfStatement {
    readonly location: Location.Location | Null.Null;
    readonly test: Expression.Expression;
    readonly consequent: BlockStatement.BlockStatement;
    readonly alternate: BlockStatement.BlockStatement | Null.Null;
    constructor({location = null, test, consequent, alternate = null}: {
        location?: Location.Location | Null.Null,
        test: Expression.Expression,
        consequent: BlockStatement.BlockStatement,
        alternate?: BlockStatement.BlockStatement | Null.Null
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Expression.isExpression(test))
            throw new Error('test is not a Expression: ' + Class.toString(test));
        if (!BlockStatement.isBlockStatement(consequent))
            throw new Error('consequent is not a BlockStatement: ' + Class.toString(consequent));
        if (!(BlockStatement.isBlockStatement(alternate) || Null.isNull(alternate)))
            throw new Error('alternate is not a BlockStatement | Null: ' + Class.toString(alternate));
        this.location = location;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    static is(value): value is IfStatement {
        return isIfStatement(value);
    }
}
IfStatement['id'] = 'IfStatement';
IfStatement['implements'] = new Set([
    'IfStatement',
    'Statement',
    'Node'
]);
export const isIfStatement = function (value): value is IfStatement {
    return Class.isInstance(IfStatement, value);
};