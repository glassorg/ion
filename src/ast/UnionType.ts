/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as TypeExpression from './TypeExpression';
import * as Expression from './Expression';
import * as Typed from './Typed';
import * as Node from './Node';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as _Array from './ion/Array';
import * as ConstrainedType from './ConstrainedType';
import * as Class from './ion/Class';
export class UnionType implements _Object.Object , TypeExpression.TypeExpression , Expression.Expression , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: Expression.Expression | Null.Null;
    readonly types: _Array.Array<ConstrainedType.ConstrainedType>;
    static readonly id = 'UnionType';
    static readonly implements = new Set([
        'UnionType',
        'ion_Object',
        'TypeExpression',
        'Expression',
        'Typed',
        'Node'
    ]);
    constructor({location = null, type = null, types}: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        types: _Array.Array<ConstrainedType.ConstrainedType>
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + Class.toString(type));
        if (!_Array.isArray(types))
            throw new Error('types is not a Array: ' + Class.toString(types));
        this.location = location;
        this.type = type;
        this.types = types;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        types?: _Array.Array<ConstrainedType.ConstrainedType>
    }) {
        return new UnionType({
            ...this,
            ...properties
        });
    }
    static is(value): value is UnionType {
        return isUnionType(value);
    }
}
export function isUnionType(value): value is UnionType {
    return Class.isInstance(UnionType, value);
}
export default UnionType;