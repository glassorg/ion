import { Expression, Reference, BinaryExpression, DotExpression, TypeExpression } from "../ast";
import simplifyExpression from "./simplifyExpression";

export function normalizeExpressions(node: Expression) {
    if (TypeExpression.is(node)) {
        node = node.value
    }
    if (Reference.is(node)) {
        return new BinaryExpression({
            location: node.location,
            left: new DotExpression({}),
            operator: "is",
            right: node
        })
    }
    return node
}

export default function combineTypeExpression(left: Expression, right: Expression): Expression | null {
    left = simplifyExpression(normalizeExpressions(left))
    right = simplifyExpression(normalizeExpressions(right))
    if (left == null) {
        return right
    }
    if (right == null) {
        return left
    }
    return simplifyExpression(new BinaryExpression({ left, operator: "&", right }))
}