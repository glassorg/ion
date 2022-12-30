import { strict as assert } from "assert";
import { CompileError, Compiler } from "../Compiler";
import { MemoryFileSystem } from "../filesystem/MemoryFileSystem";

const filename = "sample.ion";

async function testCompileError(source: string, startLine: number, startColumn: number, finishLine: number, finishColumn: number) {
    let compiler = new Compiler(new MemoryFileSystem({[filename]: source}));
    try {
        let result = await compiler.compileAllFiles();
        assert.fail(`Expected compilation to fail: ${source}`);
    }
    catch (e) {
        if (e instanceof CompileError) {
            const errors = e.semanticErrors;
            let [error] = errors;
            assert.equal(errors.length, 1, `Expected 1 error compiling: ${source}`);
            assert(error.locations.length >= 1, `Expected at least 1 location within error: ${error}`);
            let location = error.locations[0];
            let expectedLocation = { startLine, startColumn, finishLine, finishColumn };
            let actualLocation = { startLine: location.startLine, startColumn: location.startColumn, finishLine: location.finishLine, finishColumn: location.finishColumn };
            if (JSON.stringify(actualLocation) !== JSON.stringify(expectedLocation)) {
                console.log(errors.map(error => compiler.toConsoleMessage(error)).join("\n"));
            }
            assert.deepEqual(actualLocation, expectedLocation);
        }
    }
}

type Files = { [filename: string]: string };

async function testCompile(source: string | Files, debug = false) {
    let files = typeof source === "string" ? {[filename]: source} : source;
    let compiler = new Compiler(new MemoryFileSystem(files), { debugPattern: debug ? /sample\..*/ : undefined });
    let resolvedDeclarations = await compiler.compileAllFiles();
    assert(resolvedDeclarations.length > 0);
}

export async function test() {
await testCompileError(
`
var y: Number = 2
`, 1, 0, 1, 17);

await testCompileError(`
let a = b
let b = a
`, 1, 4, 1, 5);

await testCompileError(`
let a = a
`, 1, 8, 1, 9);

await testCompile(`
type Number = 1
type String = 1
class @Meta
@Meta()
function min(a: Number | String, b: Number) =>
    if a < b
        return a
    else
        return b
`);

await testCompile(`
let a = 1
let b = a
let c = b
`);

await testCompile(`
type Range = 0 .. 10
`);

await testCompile(`
class @NativeClass

@NativeClass()
class String

class @NativeFunction
    javascript: String

@NativeClass()
struct Integer

@NativeFunction("foo")
function \`+\`(a: Integer, b: Integer) => a

function add(a: Integer, b: Integer) =>
    return a + b
`);

await testCompile(`
type Integer = 1
type Float = 1
function add
    (a: Integer) => a
    (a: Float) => a
`)

}
