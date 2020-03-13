import Expression from "./Expression";
import Id from "./Id";
import BinaryExpression from "./BinaryExpression";

export default class MemberExpression extends BinaryExpression {

    operator = "."

    get object() { return this.left }
    set object(value) { this.left = value }

    get property() { return this.right }
    set property(value) { this.right = value }

}