/*
This file was generated from ion source. Do not edit.
*/
import * as _Object from './ion/Object';
import * as Expression from './Expression';
import * as Node from './Node';
import * as Typed from './Typed';
import * as Location from './Location';
import * as Null from './ion/Null';
import * as TypeExpression from './TypeExpression';
import * as Class from './ion/Class';
export class ConditionalExpression implements _Object.Object , Expression.Expression , Node.Node , Typed.Typed {
    readonly location: Location.Location | Null.Null;
    readonly type: TypeExpression.TypeExpression | Null.Null;
    readonly test: Expression.Expression;
    readonly consequent: Expression.Expression;
    readonly alternate: Expression.Expression;
    static readonly id = 'ConditionalExpression';
    static readonly implements = new Set([
        'ConditionalExpression',
        'ion_Object',
        'Expression',
        'Node',
        'Typed'
    ]);
    constructor({location = null, type = null, test, consequent, alternate}: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        test: Expression.Expression,
        consequent: Expression.Expression,
        alternate: Expression.Expression
    }) {
        if (!(Location.isLocation(location) || Null.isNull(location)))
            throw new Error('location is not a Location | Null: ' + location);
        if (!(TypeExpression.isTypeExpression(type) || Null.isNull(type)))
            throw new Error('type is not a TypeExpression | Null: ' + type);
        if (!Expression.isExpression(test))
            throw new Error('test is not a Expression: ' + test);
        if (!Expression.isExpression(consequent))
            throw new Error('consequent is not a Expression: ' + consequent);
        if (!Expression.isExpression(alternate))
            throw new Error('alternate is not a Expression: ' + alternate);
        this.location = location;
        this.type = type;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
        Object.freeze(this);
    }
    patch(properties: {
        location?: Location.Location | Null.Null,
        type?: TypeExpression.TypeExpression | Null.Null,
        test?: Expression.Expression,
        consequent?: Expression.Expression,
        alternate?: Expression.Expression
    }) {
        return new ConditionalExpression({
            ...this,
            ...properties
        });
    }
    static is(value): value is ConditionalExpression {
        return isConditionalExpression(value);
    }
}
export function isConditionalExpression(value): value is ConditionalExpression {
    return Class.isInstance(ConditionalExpression, value);
}
export default ConditionalExpression;