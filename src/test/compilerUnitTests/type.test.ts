import { strict as assert } from "assert"
import Compiler, { Options } from "../../Compiler"
import { getInputFilesRecursive } from "../../common"
import path from "path"
import { Reference } from "../../ast"
import toCodeString from "../../toCodeString"
import { absolute } from "../../pathFunctions"

let compiler = new Compiler(() => {})
let nullOptions = new Options([], "NULL")
let ionFiles = getInputFilesRecursive(path.join(__dirname, "../../../ionsrc"))
function compile(files: { [name: string]: string}) {
    return compiler.compile(nullOptions, { ...files, ...ionFiles })
}

function testOutput(files: { [name: string]: string}, expected: Array<[string, (result) => string]>) {
    files = (() => {
        let newFiles: any = {}
        for (let name in files) {
            newFiles[absolute(name)] = files[name]
        }
        return newFiles
    })()
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
    fo:
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
        # 6 (returnType of foo)
    let bar = (a: Number) =>
        if a >= 5
            return true
        else
        #          3
            return a
        #           4
        if a == 4 | a > 10
            return true
        # 5 (returnType of bar)
    class Base
        var x: Boolean
    #     6 (instanceType of Baz)
    class Baz extends Base
        var y: Integer & >= 0 & <= 10
    #   7
    let instance = Baz(x: true, y: 2)
    #   8
    let doubled = funcs.double(10)
    #   9
    let doubleFunc = funcs.double
`,
    funcs:
`
import
    ion.*
export
    #   10 (toCodeString of double type)
    let double = (a: Number) => a * 2
`
}, [
    ["/ion/types/((. is .ion.String) | (. is .ion.Number))", (result) => result.declarations.get(absolute("fo", "foo")).value.body.statements[0].test.left.left.type.name],
    ["/ion/String", (result) => result.declarations.get(absolute("fo", "foo")).value.body.statements[0].test.right.left.object.type.name],
    ["/ion/Number", (result) => result.declarations.get(absolute("fo", "foo")).value.body.statements[1].alternate.statements[1].test.left.type.name],
    ["/ion/types/((. is .ion.Number) & (. < 5))", (result) => result.declarations.get(absolute("fo", "bar")).value.body.statements[0].alternate.statements[1].value.type.name ],
    ["/ion/types/((. is .ion.Number) & (. != 4))", (result) => result.declarations.get(absolute("fo", "bar")).value.body.statements[1].test.right.left.type.name],
    //  returnType of bar
    ["/ion/types/((. is .ion.Boolean) | ((. is .ion.Number) & (. < 5)))", (result) => result.declarations.get(absolute("fo", "bar")).value.returnType.name],
    //  returnType of foo
    ["/ion/Boolean", (result) => result.declarations.get(absolute("fo", "foo")).value.returnType.name],
    //  instanceType of Baz
    ["((((. is /fo/Baz) & (. is /fo/Base)) & (..x is /ion/Boolean)) & (..y is ((. is /ion/Integer) & ((. >= 0) & (. <= 10)))))", (result) => toCodeString(result.declarations.get(absolute("fo", "Baz")).instanceType) ],
    //  type of instance
    ["/fo/Baz", (result) => result.declarations.get(absolute("fo", "instance")).type.name],
    //  type of doubled
    ["/ion/Number", (result) => result.declarations.get(absolute("fo", "doubled")).type.name ],
    //  type of doubleFunc
    ["/ion/types/typeof .fo.doubleFunc", (result) => result.declarations.get(absolute("fo", "doubleFunc")).type.name],
    //  type of double function
    ["function(a: /ion/Number) => /ion/Number", (result) => toCodeString(result.declarations.get("/ion/types/typeof .fo.doubleFunc").value)],
]
)
