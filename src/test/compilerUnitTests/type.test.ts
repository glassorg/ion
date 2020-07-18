import { strict as assert } from "assert"
import Compiler, { Options } from "../../Compiler"
import { getInputFilesRecursive, getLocalName, getAbsoluteName, EXPORT_DELIMITER } from "../../common"
import path from "path"
import { Reference } from "../../ast"
import toCodeString from "../../toCodeString"

let compiler = new Compiler(() => {})
let nullOptions = new Options([], "NULL")
let ionFiles = getInputFilesRecursive(path.join(__dirname, "../../../ionsrc"))
function compile(files: { [name: string]: string}) {
    return compiler.compile(nullOptions, { ...files, ...ionFiles })
}

function testOutput(files: { [name: string]: string}, expected: Array<[string, (result) => string]>) {
    let result = compile(files)
    for (let [expectedValue, getValueFunction] of expected) {
        let actualValue = getValueFunction(result)
        if (expectedValue.length === 0) {
            // user is just testing query
            console.log(actualValue)
        }
        else {
            assert.deepEqual(actualValue, expectedValue)
        }
    }
}

testOutput({
    foo: 
`
import
    ion.*
    .*
export
    let foo = (a: String | Number) =>
        #  0             1
        if a is String & a.length > 0
            return true
        if a is String
            return true
        #       2
        else if a != null
            return false
    let bar = (a: Number) =>
        if a >= 5
            return true
        else
        #          3
            return a
        #           4
        if a == 4 | a > 10
            return true
    class Base
        var x: Boolean
    class Baz extends Base
        var y: Integer & >= 0 & <= 10
    let instance = Baz(x: true, y: 2)
    let doubled = funcs.double(10)
    let doubleFunc = funcs.double
`,
    funcs:
`
import
    ion.*
export
    let double = (a: Number) => a * 2
`
}, [
    ["ion.types:((. is ion.String:String) | (. is ion.Number:Number))", (result) => result.declarations.get("foo:foo").value.body.statements[0].test.left.left.type.name],
    ["ion.String:String", (result) => result.declarations.get("foo:foo").value.body.statements[0].test.right.left.object.type.name],
    ["ion.Number:Number", (result) => result.declarations.get("foo:foo").value.body.statements[1].alternate.test.left.type.name],
    ["ion.types:((. is ion.Number:Number) & (. < 5))", (result) => result.declarations.get("foo:bar").value.body.statements[0].alternate.statements[0].value.type.name ],
    ["ion.types:((. is ion.Number:Number) & (. != 4))", (result) => result.declarations.get("foo:bar").value.body.statements[1].test.right.left.type.name],
    //  returnType of bar
    ['ion.types:((. is ion.Boolean:Boolean) | ((. is ion.Number:Number) & (. < 5)))', (result) => result.declarations.get("foo:bar").value.returnType.name],
    //  returnType of foo
    ['ion.Boolean:Boolean', (result) => result.declarations.get("foo:foo").value.returnType.name],
    //  instanceType of Baz
    ['((((. is foo:Baz) & (. is foo:Base)) & (..x is ion.Boolean:Boolean)) & (..y is ((. is ion.Integer:Integer) & ((. >= 0) & (. <= 10)))))', (result) => toCodeString(result.declarations.get("foo:Baz").instanceType) ],
    //  type of instance
    ['foo:Baz', (result) => result.declarations.get("foo:instance").type.name],
    //  type of doubled
    ['ion.Number:Number', (result) => result.declarations.get("foo:doubled").type.name ],
    //  type of doubleFunc
    ['ion.types:function(a: ion.Number:Number) => ion.Number:Number', (result) => result.declarations.get("foo:doubleFunc").type.name]
]
)
