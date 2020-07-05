import { Expression, Reference, BinaryExpression, DotExpression } from "../ast";
import simplifyExpression from "./simplifyExpression";

export function convertReferencesToTypeChecks(node: Expression) {
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
    left = convertReferencesToTypeChecks(left)
    right = convertReferencesToTypeChecks(right)
    if (left == null) {
        return right
    }
    if (right == null) {
        return left
    }
    return simplifyExpression(new BinaryExpression({ left, operator: "&", right }))
}