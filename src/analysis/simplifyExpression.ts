import { Expression, BinaryExpression, ExpressionStatement } from "../ast";
import toCodeString from "../toCodeString";

function find<T>(items: Iterable<T>, predicate: (value: T) => boolean): T | null {
    for (let item of items) {
        if (predicate(item)) {
            return item
        }
    }
    return null
}

function *binaryExpressionComponents(e: Expression, operator: string): Iterable<Expression> {
    if (BinaryExpression.is(e) && e.operator === operator) {
        yield* binaryExpressionComponents(e.left, operator)
        yield* binaryExpressionComponents(e.right, operator)
    }
    else {
        yield e
    }
}

function equals(a: Expression, b: Expression) {
    return toCodeString(a) === toCodeString(b)
}

const reassociateLeft = {
    "|": true,
    "&": true,
    "+": true,
    "*": true,
}

function normalize(e: Expression): Expression {
    if (BinaryExpression.is(e)) {
        if (reassociateLeft[e.operator]) {
            if (BinaryExpression.is(e.right) && e.right.operator === e.operator) {
                return new BinaryExpression({
                    location: e.location,
                    left: new BinaryExpression({
                        location: e.right.location,
                        left: e.left,
                        operator: e.operator,
                        right: e.right.left
                    }),
                    operator: e.operator,
                    right: e.right.right
                })
            }
        }
    }
    return e
}

// let normalizedCache = new WeakMap<Expression,Expression>()
// export function normalizeExpression(e: Expression) {
//     if (e == null) {
//         return e
//     }
//     let result = cached.get(e)
//     if (result == null) {
//         result = normalizeInternal(e)
//         cached.set(e, result)
//         if (e !== result) {
//             // make sure we don't try to simplify an already simplified result
//             cached.set(result, result)
//         }
//     }
//     return result
// }

// A & B | A => A
function simplifyInternal(e: Expression): Expression {
    e = normalize(e)
    if (BinaryExpression.is(e)) {
        let left = simplifyExpression(e.left)
        let right = simplifyExpression(e.right)
        if (equals(left, right)) {
            if (e.operator === "&" || e.operator == "|") {
                //  A & A => A
                //  A | A => A
                return left
            }
        }
        else if (e.operator === "|") {
            if (find(binaryExpressionComponents(left, "&"), c => equals(c, right))) {
                // A & B | A => A
                return right
            }
            if (find(binaryExpressionComponents(right, "&"), c => equals(c, left))) {
                //  A | A & B => A
                return left
            }
            if (find(binaryExpressionComponents(left, "|"), c => equals(c, right))) {
                // (A | B) | A => A | B
                return left
            }
            if (find(binaryExpressionComponents(right, "|"), c => equals(c, left))) {
                //  A | (A & B) => A | B
                return right
            }
        }
        else if (e.operator === "&") {
            if (find(binaryExpressionComponents(left, "|"), c => equals(c, right))) {
                // (A | B) & A => A
                return right
            }
            if (find(binaryExpressionComponents(right, "|"), c => equals(c, left))) {
                // A & (A | B) => A
                return left
            }
        }
        // should be normalized
        if (e.left !== left || e.right !== right) {
            e = e.patch({ left, right })
        }
    }
    return e
}
let cached = new WeakMap<Expression,Expression>()
export default function simplifyExpression(e: Expression) {
    if (e == null) {
        return e
    }
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