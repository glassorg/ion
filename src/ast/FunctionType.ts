/*
This file was generated from ion source. Do not edit.
*/
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Array from './ion/Array';
import * as Parameter from './Parameter';
import * as Class from './ion/Class';
export class FunctionType {
    readonly location: Location.Location | Null.Null;
    readonly parameters: Array.Array<Parameter.Parameter>;
    readonly returnType: Expression.Expression | Null.Null;
    constructor({location = null, parameters, returnType = null}: {
        location?: Location.Location | Null.Null,
        parameters: Array.Array<Parameter.Parameter>,
        returnType?: Expression.Expression | Null.Null
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Array.isArray(parameters))
            throw new Error('parameters is not a Array: ' + Class.toString(parameters));
        if (!(Expression.isExpression(returnType) || Null.isNull(returnType)))
            throw new Error('returnType is not a Expression | Null: ' + Class.toString(returnType));
        this.location = location;
        this.parameters = parameters;
        this.returnType = returnType;
        Object.freeze(this);
    }
    static is(value): value is FunctionType {
        return isFunctionType(value);
    }
}
FunctionType['id'] = 'FunctionType';
FunctionType['implements'] = new Set([
    'FunctionType',
    'TypeExpression',
    'Expression',
    'Node'
]);
export const isFunctionType = function (value): value is FunctionType {
    return Class.isInstance(FunctionType, value);
};
export default FunctionType;