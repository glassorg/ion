/*
This file was generated from ion source. Do not edit.
*/
import * as Statement from './Statement';
import * as Scope from './Scope';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Array from './ion/Array';
import * as Class from './ion/Class';
export class BlockStatement {
    readonly location: Location.Location | Null.Null;
    readonly statements: Array.Array<Statement.Statement>;
    constructor({location = null, statements}: {
        location?: Location.Location | Null.Null,
        statements: Array.Array<Statement.Statement>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Array.isArray(statements))
            throw new Error('statements is not a Array: ' + Class.toString(statements));
        this.location = location;
        this.statements = statements;
    }
    static is(value): value is BlockStatement {
        return isBlockStatement(value);
    }
}
BlockStatement['id'] = 'BlockStatement';
BlockStatement['implements'] = new Set([
    'BlockStatement',
    'Statement',
    'Scope',
    'Node',
    'Node'
]);
export const isBlockStatement = function (value): value is BlockStatement {
    return Class.isInstance(BlockStatement, value);
};