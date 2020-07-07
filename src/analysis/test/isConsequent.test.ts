import { strict as assert } from "assert"
import { BinaryExpression, Reference, Id, MemberExpression, UnaryExpression, CallExpression, Argument, Literal, Expression } from "../../ast"
import toCodeString from "../../toCodeString"
import isConsequent from "../isConsequent"
import simplifyExpression from "../simplifyExpression"

function e(expr: string | number | Expression) {
    if (!Expression.is(expr)) {
        expr = typeof expr === 'string' ? new Reference({ name: expr }) : new Literal({ value: expr })
    }
    return expr
}
function b(left: string | Expression, operator: string, right: string | number | Expression) {
    left = e(left)
    right = e(right)
    return new BinaryExpression({ left, operator, right })
}
function c(callee, ...args: Array<string | number | Expression>) {
    return new CallExpression({
        callee: e(callee),
        arguments: args.map(e).map(value => new Argument({ value }))
    })
}
function testConsequent(a: Expression, b: Expression, ab_expected: true | false | null, ba_expected: true | false | null) {
    const ab_actual = isConsequent(a, b)
    const ba_actual = isConsequent(b, a)
    assert.equal(ab_actual, ab_expected, `\n${toCodeString(a)} => ${toCodeString(b)}, expected ${ab_expected}, actual: ${ab_actual}`)
    assert.equal(ba_actual, ba_expected, `\n${toCodeString(b)} => ${toCodeString(a)}, expected ${ba_expected}, actual: ${ba_actual}`)
}

testConsequent(b("foo", ">", 1), b("foo", ">", 0), true, null)
testConsequent(b("foo", "<", 1), b("foo", "<", 2), true, null)
testConsequent(b("foo", ">=", 1), b("foo", ">=", 0), true, null)
testConsequent(b("foo", "<=", 1), b("foo", "<=", 2), true, null)
testConsequent(b("foo", ">", 0), b("foo", ">", 0), true, true)
testConsequent(b("foo", ">", 0), b("foo", "<", 0), false, false)
testConsequent(b("foo", ">=", 0), b("foo", "<", 0), false, false)
testConsequent(b("foo", ">=", 0), b("foo", "<=", 0), null, null)
testConsequent(b("foo", "<", 0), b("foo", "!=", 0), true, null)
testConsequent(b("foo", ">", 0), b("foo", "!=", 0), true, null)
testConsequent(b("foo", "==", 0), b("foo", "<=", 0), true, null)
testConsequent(b("foo", "==", 0), b("foo", ">=", 0), true, null)
testConsequent(b("foo", "==", "x"), b("foo", ">=", "x"), true, null)
testConsequent(b("foo", "==", "x"), b("foo", "<=", "x"), true, null)
testConsequent(b("foo", "==", "x"), b("foo", ">", "x"), false, false)
testConsequent(b("foo", "==", "x"), b("foo", "<", "x"), false, false)
testConsequent(b("foo", ">", "x"), b("foo", ">=", "x"), true, null)
testConsequent(b("foo", "<", "x"), b("foo", "<=", "x"), true, null)
testConsequent(b("foo", "<", "x"), b("foo", "!=", "x"), true, null)
testConsequent(b("foo", ">", 0), b("foo", "!=", 0), true, null)
testConsequent(
    b(b("foo", "<", "x"), "|", b("foo", ">", "x")),
    b("foo", "!=", "x"),
    true,
    null    // although conceptually, != x implies > x | < x, our analysis does not recognize this.
)

testConsequent(b("foo", "is", "Bar"), b("foo", "isnt", "Bar"), false, false)
testConsequent(b("foo", "is", "Bar"), b("foo", "is", "Bar"), true, true)
testConsequent(b("foo", "is", "Bar"), b("foo", "is", "Fuz"), null, null)
testConsequent(
    b(b("foo", "is", "Bar"), "|", b("foo", "is", "Baz")),
    b("foo", "is", "Bar"),
    null,
    true
)
testConsequent(
    b(b("foo", "is", "Bar"), "&", b("foo", "is", "Baz")),
    b("foo", "is", "Bar"),
    true,
    null
)
testConsequent(
    b(b("foo", "is", "Bar"), "&", b("foo", "is", "Baz")),
    b(b("foo", "is", "Bar"), "|", b("foo", "is", "Baz")),
    true,
    null
)
testConsequent(
    b(b("foo", ">", 0), "&", b("foo", "<", 10)),
    b(b("foo", ">", 1), "&", b("foo", "<", 8)),
    null,
    true
)
testConsequent(
    b(b("foo", ">", 0), "|", b("foo", "<", 10)),
    b(b("foo", ">", 1), "|", b("foo", "<", 8)),
    null,
    true
)
testConsequent(
    b(b("foo", ">", 0), "|", b("foo", "<", 10)),
    b(b("foo", ">", 1), "&", b("foo", "<", 8)),
    null,
    true
)
testConsequent(
    b(c("foo", 1, 2), "&", c("bar", 3, 4)),
    c("foo", 1, 2),
    true,
    null
)

// simplify Expressions test

function testSimplify(input: Expression, expected: Expression) {
    let actual = simplifyExpression(input)
    let as = toCodeString(actual)
    let es = toCodeString(expected)
    assert(as === es, `simplify(${toCodeString(input)}), expected: ${es}, actual: ${as}`)
}

const A = e("A")
const B = e("B")

testSimplify(b(b(A, "&", B), "|", B), B)
testSimplify(b(b(A, "&", A), "|", A), A)
testSimplify(b(B, "|", b(A, "&", B)), B)
testSimplify(b(A, "|", b(A, "&", B)), A)

testSimplify(b(b(A, "|", B), "|", B), b(A, "|", B))
testSimplify(b(A, "|", b(B, "|", A)), b(A, "|", B))

testSimplify(b(b(A, "|", B), "&", A), A)
testSimplify(b(A, "&", b(A, "|", B)), A)

testSimplify(b(b(A, "|", B), "&", B), B)