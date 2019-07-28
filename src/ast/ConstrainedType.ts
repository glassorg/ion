import TypeExpression from "./TypeExpression";
import Reference from "./Reference";
import Expression from "./Expression";

export default class ConstrainedType extends TypeExpression {

    baseType!: Reference
    constraint!: Expression

}