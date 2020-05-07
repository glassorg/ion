/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as _Array from './ion/Array';
import * as Parameter from './Parameter';
import * as Class from './ion/Class';
export class FunctionType implements _Object.Object , TypeExpression.TypeExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly parameters: _Array.Array<Parameter.Parameter>;
    readonly returnType: Expression.Expression | Null.Null;
    static readonly id = 'FunctionType';
    static readonly implements = new Set([
        'FunctionType',
        'ion_Object',
        'TypeExpression',
        'Expression',
        'Node'
    ]);
    constructor({location = null, type = null, parameters, returnType = null}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        parameters: _Array.Array<Parameter.Parameter>,
        returnType?: Expression.Expression | Null.Null
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        if (!_Array.isArray(parameters))
            throw new Error('parameters is not a Array: ' + parameters);
        if (!(Expression.isExpression(returnType) || Null.isNull(returnType)))
            throw new Error('returnType is not a Expression | Null: ' + returnType);
        this.location = location;
        this.type = type;
        this.parameters = parameters;
        this.returnType = returnType;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        parameters?: _Array.Array<Parameter.Parameter>,
        returnType?: Expression.Expression | Null.Null
    }) {
        return new FunctionType({
            ...this,
            ...properties
        });
    }
    static is(value): value is FunctionType {
        return isFunctionType(value);
    }
}
export function isFunctionType(value): value is FunctionType {
    return Class.isInstance(FunctionType, value);
}
export default FunctionType;