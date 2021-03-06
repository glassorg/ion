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
import * as Reference from './Reference';
import * as Class from './ion/Class';
export class TemplateReference implements _Object.Object , TypeExpression.TypeExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly baseType: Expression.Expression;
    readonly arguments: _Array.Array<TypeExpression.TypeExpression | Reference.Reference>;
    static readonly id = 'TemplateReference';
    static readonly implements = new Set([
        'TemplateReference',
        'ion_Object',
        'TypeExpression',
        'Expression',
        'Node'
    ]);
    constructor({
        location = null,
        type = null,
        baseType,
        arguments: _arguments
    }: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        baseType: Expression.Expression,
        arguments: _Array.Array<TypeExpression.TypeExpression | Reference.Reference>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        if (!Expression.isExpression(baseType))
            throw new Error('baseType is not a Expression: ' + baseType);
        if (!_Array.isArray(_arguments))
            throw new Error('arguments is not a Array: ' + _arguments);
        this.location = location;
        this.type = type;
        this.baseType = baseType;
        this.arguments = _arguments;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        baseType?: Expression.Expression,
        arguments?: _Array.Array<TypeExpression.TypeExpression | Reference.Reference>
    }) {
        return new TemplateReference({
            ...this,
            ...properties
        });
    }
    static is(value): value is TemplateReference {
        return isTemplateReference(value);
    }
}
export function isTemplateReference(value): value is TemplateReference {
    return Class.isInstance(TemplateReference, value);
}
export default TemplateReference;