import TypeExpression from "./TypeExpression";
import Expression from "./Expression";
import BinaryExpression from "./BinaryExpression";
import { mixin } from "./runtime";

export default class UnionType extends BinaryExpression implements TypeExpression {

    left!: Expression
    operator = "|"
    right!: Expression

}

mixin(UnionType, TypeExpression)
