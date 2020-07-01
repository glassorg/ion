import { strict as assert } from "assert"
import { BinaryExpression, Reference, Id, MemberExpression, UnaryExpression, CallExpression, Argument, Literal, Expression } from "../../ast"
import toCodeString from "../../toCodeString"
import isConsequent from "../isConsequent"

function toExpression(e: string | number | Expression) {
    if (!Expression.is(e)) {
        e = typeof e === 'string' ? new Reference({ name: e }) : new Literal({ value: e })
    }
    return e
}
function b(left: string | Expression, operator: string, right: string | number | Expression) {
    left = toExpression(left)
    right = toExpression(right)
    return new BinaryExpression({ left, operator, right })
}
function c(callee, ...args: Array<string | number | Expression>) {
    return new CallExpression({
        callee: toExpression(callee),
        arguments: args.map(toExpression).map(value => new Argument({ value }))
    })
}
function test(a: Expression, b: Expression, ab_expected: true | false | null, ba_expected: true | false | null) {
    const ab_actual = isConsequent(a, b)
    const ba_actual = isConsequent(b, a)
    assert.equal(ab_actual, ab_expected, `\n${toCodeString(a)} => ${toCodeString(b)}, expected ${ab_expected}, actual: ${ab_actual}`)
    assert.equal(ba_actual, ba_expected, `\n${toCodeString(b)} => ${toCodeString(a)}, expected ${ba_expected}, actual: ${ba_actual}`)
}

test(b("foo", ">", 1), b("foo", ">", 0), true, null)
test(b("foo", "<", 1), b("foo", "<", 2), true, null)
test(b("foo", ">=", 1), b("foo", ">=", 0), true, null)
test(b("foo", "<=", 1), b("foo", "<=", 2), true, null)
test(b("foo", ">", 0), b("foo", ">", 0), true, true)
test(b("foo", ">", 0), b("foo", "<", 0), false, false)
test(b("foo", ">=", 0), b("foo", "<", 0), false, false)
test(b("foo", ">=", 0), b("foo", "<=", 0), null, null)
test(b("foo", "<", 0), b("foo", "!=", 0), true, null)
test(b("foo", ">", 0), b("foo", "!=", 0), true, null)
test(b("foo", "==", 0), b("foo", "<=", 0), true, null)
test(b("foo", "==", 0), b("foo", ">=", 0), true, null)
test(b("foo", "==", "x"), b("foo", ">=", "x"), true, null)
test(b("foo", "==", "x"), b("foo", "<=", "x"), true, null)
test(b("foo", "==", "x"), b("foo", ">", "x"), false, false)
test(b("foo", "==", "x"), b("foo", "<", "x"), false, false)
test(b("foo", ">", "x"), b("foo", ">=", "x"), true, null)
test(b("foo", "<", "x"), b("foo", "<=", "x"), true, null)
test(b("foo", "<", "x"), b("foo", "!=", "x"), true, null)
test(b("foo", ">", 0), b("foo", "!=", 0), true, null)
test(
    b(b("foo", "<", "x"), "|", b("foo", ">", "x")),
    b("foo", "!=", "x"),
    true,
    null    // although conceptually, != x implies > x | < x, our analysis does not recognize this.
)

test(b("foo", "is", "Bar"), b("foo", "isnt", "Bar"), false, false)
test(b("foo", "is", "Bar"), b("foo", "is", "Bar"), true, true)
test(b("foo", "is", "Bar"), b("foo", "is", "Fuz"), null, null)
test(
    b(b("foo", "is", "Bar"), "|", b("foo", "is", "Baz")),
    b("foo", "is", "Bar"),
    null,
    true
)
test(
    b(b("foo", "is", "Bar"), "&", b("foo", "is", "Baz")),
    b("foo", "is", "Bar"),
    true,
    null
)
test(
    b(b("foo", "is", "Bar"), "&", b("foo", "is", "Baz")),
    b(b("foo", "is", "Bar"), "|", b("foo", "is", "Baz")),
    true,
    null
)
test(
    b(b("foo", ">", 0), "&", b("foo", "<", 10)),
    b(b("foo", ">", 1), "&", b("foo", "<", 8)),
    null,
    true
)
test(
    b(b("foo", ">", 0), "|", b("foo", "<", 10)),
    b(b("foo", ">", 1), "|", b("foo", "<", 8)),
    null,
    true
)
test(
    b(b("foo", ">", 0), "|", b("foo", "<", 10)),
    b(b("foo", ">", 1), "&", b("foo", "<", 8)),
    null,
    true
)
test(
    b(c("foo", 1, 2), "&", c("bar", 3, 4)),
    c("foo", 1, 2),
    true,
    null
)

