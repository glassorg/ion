import Expression from "./Expression";

export default class UnaryExpression extends Expression {

    operator!: string
    argument!: Expression

}