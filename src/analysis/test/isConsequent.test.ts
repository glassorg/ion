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
function test(a: Expression, b: Expression, a_b: true | false | null, b_a: true | false | null) {
    assert.equal(isConsequent(a, b), a_b, `\n${toCodeString(a)} => ${toCodeString(b)}, expected ${a_b}, actual: ${isConsequent(a, b)}`)
    assert.equal(isConsequent(b, a), b_a, `\n${toCodeString(b)} => ${toCodeString(a)}, expected ${b_a}, actual: ${isConsequent(b, a)}`)
}

test(b("foo", ">", 1), b("foo", ">", 0), true, null)
test(b("foo", "<", 1), b("foo", "<", 2), true, null)
test(b("foo", ">=", 1), b("foo", ">=", 0), true, null)
test(b("foo", "<=", 1), b("foo", "<=", 2), true, null)
test(b("foo", ">", 0), b("foo", ">", 0), true, true)
test(b("foo", ">", 0), b("foo", "<", 0), false, false)
test(b("foo", ">=", 0), b("foo", "<", 0), false, false)
test(b("foo", ">=", 0), b("foo", "<=", 0), null, null)
test(b("foo", "==", 0), b("foo", "<=", 0), true, null)
test(b("foo", "==", 0), b("foo", ">=", 0), true, null)
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


