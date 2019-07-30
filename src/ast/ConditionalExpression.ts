import Expression from "./Expression";
import BlockStatement from "./BlockStatement";

export default class ConditionalExpression extends Expression {

    test!: Expression
    consequent!: Expression
    alternate!: Expression

}