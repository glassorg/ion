import TypeExpression from "./TypeExpression";
import Expression from "./Expression";
import { mixin } from "./runtime";
import BinaryExpression from "./BinaryExpression";

export default class IntersectionType extends BinaryExpression implements TypeExpression {

    left!: Expression
    operator = "&"
    right!: Expression

}

mixin(IntersectionType, TypeExpression)
