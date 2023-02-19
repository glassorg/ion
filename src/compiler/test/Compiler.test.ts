import { strict as assert } from "assert";
import { Declaration } from "../ast/Declaration";
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
                console.log("Error: " + e);
                console.log(errors.map(error => compiler.toConsoleMessage(error)).join("\n"));
            }
            assert.deepEqual(actualLocation, expectedLocation);
        }
        else {
            throw e;
        }
    }
}

type Files = { [filename: string]: string };

async function testCompile(source: string | Files, checkTypes?: { [key: string]: string}, debug = false) {
    let files = typeof source === "string" ? {[filename]: source} : source;
    let compiler = new Compiler(new MemoryFileSystem(files), { debugPattern: debug ? /.*/ : undefined });
    let assembly = await compiler.compileAllFiles();
    let resolvedDeclarations = assembly.declarations;
    assert(resolvedDeclarations.length > 0);

    // doesn't work yet...
    if (checkTypes) {
        for (const name in checkTypes) {
            const expectedType = checkTypes[name];
            const declaration = resolvedDeclarations.find(d => d.id.name === name);
            if (!declaration) {
                throw new Error(`Declaration not found: ${name}`);
            }
            console.log(declaration.toString());
        }
        // console.log(resolvedDeclarations.map(a => a.id.name));
    }
}

export async function test() {
// await testCompileError(
// `
// struct Integer
// struct Number
// var y: Number = 2
// `, 3, 0, 3, 17);

await testCompileError(
`
struct Integer
function bar(a: 0 .. 3)
    if a < 0
        return a
    return a
`, 3, 7, 3, 12);

await testCompileError(
`
struct Integer
function bar(a: 0 .. 3)
    if a > -1 && a < 4
        return a
    return a
`, 3, 7, 3, 22);

// // await testCompileError(`
// // let a = b
// // let b = a
// // `, 1, 4, 1, 5);

// // await testCompileError(`
// // let a = a
// // `, 1, 8, 1, 9);

await testCompile(`
struct Integer
struct String
class @Meta
@Meta()
function min(a: Integer | String, b: Integer)
    if a < b
        return a
    else
        return b
`);

await testCompile(`
struct Integer
let a = 1
let b = a
let c = b
`);

await testCompile(`
struct Integer
type Range = 0 .. 10
`);

await testCompile(`
struct String
struct Integer
function \`+\`(a: Integer, b: Integer)
    return a
function add(a: Integer, b: Integer)
    return a + b
`);

}
