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
import * as Class from './ion/Class';
export class TypeDefinition implements _Object.Object , TypeExpression.TypeExpression , Expression.Expression , Typed.Typed , Node.Node {
    readonly location: Location.Location | Null.Null;
    readonly type: Expression.Expression | Null.Null;
    readonly expression: Expression.Expression;
    static readonly id = 'TypeDefinition';
    static readonly implements = new Set([
        'TypeDefinition',
        'ion_Object',
        'TypeExpression',
        'Expression',
        'Typed',
        'Node'
    ]);
    constructor({location = null, type = null, expression}: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        expression: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + Class.toString(location));
        if (!(Expression.isExpression(type) || Null.isNull(type)))
            throw new Error('type is not a Expression | Null: ' + Class.toString(type));
        if (!Expression.isExpression(expression))
            throw new Error('expression is not a Expression: ' + Class.toString(expression));
        this.location = location;
        this.type = type;
        this.expression = expression;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: Expression.Expression | Null.Null,
        expression?: Expression.Expression
    }) {
        return new TypeDefinition({
            ...this,
            ...properties
        });
    }
    static is(value): value is TypeDefinition {
        return isTypeDefinition(value);
    }
}
export function isTypeDefinition(value): value is TypeDefinition {
    return Class.isInstance(TypeDefinition, value);
}
export default TypeDefinition;