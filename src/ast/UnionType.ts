import TypeExpression from "./TypeExpression";
import Expression from "./Expression";

export default class UnionType extends TypeExpression {

    left!: Expression
    right!: Expression

}