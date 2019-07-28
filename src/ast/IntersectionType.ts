import TypeExpression from "./TypeExpression";
import Expression from "./Expression";

export class IntersectionType extends TypeExpression {

    left!: Expression
    right!: Expression

}