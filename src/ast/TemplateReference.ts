/*
This file was generated from ion source. Do not edit.
*/
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as Reference from './Reference';
import * as Array from './ion/Array';
import * as Class from './ion/Class';
export class TemplateReference implements TypeExpression.TypeExpression , Expression.Expression , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly baseType: Reference.Reference;
    readonly arguments: Array.Array<TypeExpression.TypeExpression | Reference.Reference>;
    constructor({
        location = null,
        baseType,
        arguments: _arguments
    }: {
        location?: Location.Location | Null.Null,
        baseType: Reference.Reference,
        arguments: Array.Array<TypeExpression.TypeExpression | Reference.Reference>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!Reference.isReference(baseType))
            throw new Error('baseType is not a Reference: ' + Class.toString(baseType));
        if (!Array.isArray(_arguments))
            throw new Error('arguments is not a Array: ' + Class.toString(_arguments));
        this.location = location;
        this.baseType = baseType;
        this.arguments = _arguments;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        baseType?: Reference.Reference,
        arguments?: Array.Array<TypeExpression.TypeExpression | Reference.Reference>
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
TemplateReference['id'] = 'TemplateReference';
TemplateReference['implements'] = new Set([
    'TemplateReference',
    'TypeExpression',
    'Expression',
    'Node'
]);
export const isTemplateReference = function (value): value is TemplateReference {
    return Class.isInstance(TemplateReference, value);
};
export default TemplateReference;