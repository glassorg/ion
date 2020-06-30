import { strict as assert } from "assert"
import { BinaryExpression, Reference, Id, MemberExpression, UnaryExpression, CallExpression, Argument, Literal, Expression } from "../../ast"
import toCodeString from "../../toCodeString"
import isConsequent from "../isConsequent"

function b(left: string | Expression, operator: string, right: string | number | Expression) {
    if (!Expression.is(left)) {
        left = new Reference({ name: left })
    }
    if (!Expression.is(right)) {
        right = typeof right === 'string' ? new Reference({ name: right }) : new Literal({ value: right })
    }
    return new BinaryExpression({ left, operator, right })
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


