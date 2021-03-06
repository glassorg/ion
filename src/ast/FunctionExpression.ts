/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Scope from './Scope';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as Id from './Id';
import * as _Array from './ion/Array';
import * as Parameter from './Parameter';
import * as BlockStatement from './BlockStatement';
import * as Reference from './Reference';
import * as Class from './ion/Class';
export class FunctionExpression implements _Object.Object , Expression.Expression , Scope.Scope , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly id: Id.Id | Null.Null;
    readonly parameters: _Array.Array<Parameter.Parameter>;
    readonly returnType: Expression.Expression | Null.Null;
    readonly body: BlockStatement.BlockStatement;
    readonly typeGuard: Reference.Reference | Null.Null;
    static readonly id = 'FunctionExpression';
    static readonly implements = new Set([
        'FunctionExpression',
        'ion_Object',
        'Expression',
        'Scope',
        'Node'
    ]);
    constructor({location = null, type = null, id = null, parameters, returnType = null, body, typeGuard = null}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        id?: Id.Id | Null.Null,
        parameters: _Array.Array<Parameter.Parameter>,
        returnType?: Expression.Expression | Null.Null,
        body: BlockStatement.BlockStatement,
        typeGuard?: Reference.Reference | Null.Null
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        if (!(Id.isId(id) || Null.isNull(id)))
            throw new Error('id is not a Id | Null: ' + id);
        if (!_Array.isArray(parameters))
            throw new Error('parameters is not a Array: ' + parameters);
        if (!(Expression.isExpression(returnType) || Null.isNull(returnType)))
            throw new Error('returnType is not a Expression | Null: ' + returnType);
        if (!BlockStatement.isBlockStatement(body))
            throw new Error('body is not a BlockStatement: ' + body);
        if (!(Reference.isReference(typeGuard) || Null.isNull(typeGuard)))
            throw new Error('typeGuard is not a Reference | Null: ' + typeGuard);
        this.location = location;
        this.type = type;
        this.id = id;
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
        this.typeGuard = typeGuard;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        id?: Id.Id | Null.Null,
        parameters?: _Array.Array<Parameter.Parameter>,
        returnType?: Expression.Expression | Null.Null,
        body?: BlockStatement.BlockStatement,
        typeGuard?: Reference.Reference | Null.Null
    }) {
        return new FunctionExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is FunctionExpression {
        return isFunctionExpression(value);
    }
}
export function isFunctionExpression(value): value is FunctionExpression {
    return Class.isInstance(FunctionExpression, value);
}
export default FunctionExpression;