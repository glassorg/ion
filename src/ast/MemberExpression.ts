import Expression from "./Expression";
import Id from "./Id";

export default class MemberExpression extends Expression {

    object!: Expression
    property!: Id

}