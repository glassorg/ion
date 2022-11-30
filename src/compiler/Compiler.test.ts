import { strict as assert } from "assert";
import { Compiler } from "./Compiler";
import { MemoryFileSystem } from "./filesystem/MemoryFileSystem";

const filename = "sample.ion";

async function testCompileError(source: string, startLine: number, startColumn: number, finishLine: number, finishColumn: number) {
    let compiler = new Compiler(new MemoryFileSystem({[filename]: source}));
    let errors = await compiler.compileAllFiles();
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

type Files = { [filename: string]: string };

async function testCompile(source: string | Files, debug = false) {
    let files = typeof source === "string" ? {[filename]: source} : source;
    let compiler = new Compiler(new MemoryFileSystem(files), { debugPattern: debug ? /sample\..*/ : undefined });
    let errors = await compiler.compileAllFiles();
    assert.equal(errors.length, 0, `Expected this to compile without errors:\n${source}`);
}

export async function test() {
// await testCompileError(
// `
// var y: Number = 2
// `, 1, 0, 1, 17);

await testCompile(`
function min(a: Number | String, b: Number) =>
    if a < b
        return a
    else
        return b
`, true);

await testCompile(`
let a = 1
let b = a + 1
`, true);

}

