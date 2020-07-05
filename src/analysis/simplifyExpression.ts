import { Expression, BinaryExpression, ExpressionStatement } from "../ast";
import toCodeString from "../toCodeString";

function simplifyInternal(e: Expression): Expression {
    if (BinaryExpression.is(e)) {
        let left = simplifyExpression(e.left)
        let right = simplifyExpression(e.right)
        if (e.operator === "&" || e.operator == "|") {
            if (toCodeString(left) === toCodeString(right)) {
                return left
            }
        }
        if (e.left !== left || e.right !== right) {
            e = e.patch({ left, right })
        }
    }
    return e
}
let cached = new WeakMap<Expression,Expression>()
export default function simplifyExpression(e: Expression) {
    let result = cached.get(e)
    if (result == null) {
        result = simplifyInternal(e)
        cached.set(e, result)
        if (e !== result) {
            // make sure we don't try to simplify an already simplified result
            cached.set(result, result)
        }
    }
    return result
}