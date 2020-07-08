import { Expression, BinaryExpression, ExpressionStatement, UnaryExpression } from "../ast";
import toCodeString from "../toCodeString";
import { memoize } from "../common";
import { traverse } from "../Traversal";

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

// A & B | A => A
function simplifyInternal(e: Expression): Expression {
    e = normalize(e)
    if (BinaryExpression.is(e)) {
        const left = simplifyExpression(e.left)
        const right = simplifyExpression(e.right)
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
            for (let c of binaryExpressionComponents(left, "|")) {
                if (equals(c, right)) {
                    // (A | B) & A => A
                    return right
                }
                if (UnaryExpression.is(right) && right.operator === "not" && equals(c, right.argument)) {
                    //  (A | B) & !A => B
                    //  (A | B | C) & !A => B | C
                    return traverse(left, {
                        // find and remove the impossible clause
                        leave(node) {
                            if (BinaryExpression.is(node) && node.operator === "|") {
                                if (equals(node.left, right.argument)) {
                                    return node.right
                                }
                                if (equals(node.right, right.argument)) {
                                    return node.left
                                }
                            }
                        }
                    })
                }
            }
            for (let c of binaryExpressionComponents(right, "|")) {
                if (equals(c, left)) {
                    // A & (A | B) => A
                    return left
                }
            }
        }
        // should be normalized
        if (e.left !== left || e.right !== right) {
            e = e.patch({ left, right })
        }
    }
    return e
}

const simplifyExpression = memoize(simplifyInternal, true)
export default simplifyInternal