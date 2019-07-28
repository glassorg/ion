import Expression from "./Expression";

export default class BinaryExpression extends Expression {

    left!: Expression
    operator!: string
    right!: Expression

}