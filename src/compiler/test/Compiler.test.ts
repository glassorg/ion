import { strict as assert } from "assert";
import { CompileError, Compiler } from "../Compiler";
import { MemoryFileSystem } from "../filesystem/MemoryFileSystem";

const filename = "sample.ion";

interface ExpectedErrors {
    source: string;
    startLine: number;
    startColumn: number;
    finishLine: number;
    finishColumn: number;
    expectedError: string;
}

function extractExpectedError(source: string): ExpectedErrors {
    let ee: ExpectedErrors = { source, startLine: 0, startColumn: 0, finishLine: 0, finishColumn: 0, expectedError: "" };
    let count = 0;
    ee.source = source.split("\n").filter((line, lineIndex) => {
        let result = /\|{3,}/.exec(line);
        if (result) {
            let length = result[0].length;
            let error = line.slice(result.index + length).trim();
            if (result.index >= 0) {
                if (!ee.expectedError) {
                    ee.expectedError = error;
                }
                if (count++ === 0) {
                    ee.startLine = lineIndex;
                    ee.startColumn = result.index;
                }
                ee.finishLine = lineIndex;
                ee.finishColumn = result.index + length;
                return false;
            }
        }
        return true;
    }).join("\n");
    if (!ee.expectedError) {
        throw new Error("Missing expected error");
    }
    return ee;
}

async function testCompileError(rawSource: string) {
    let { source, startLine, startColumn, finishLine, finishColumn, expectedError } = extractExpectedError(rawSource);
    const sources = {[filename]: source};
    let compiler = new Compiler(new MemoryFileSystem(sources));
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
            assert(error.message.indexOf(expectedError) >= 0, `Expected error (${error.message}) to contain (${expectedError})`);
            let location = error.locations[0];
            let expectedLocation = { startLine, startColumn, finishLine, finishColumn };
            let actualLocation = { startLine: location.startLine, startColumn: location.startColumn, finishLine: location.finishLine, finishColumn: location.finishColumn };
            if (JSON.stringify(actualLocation) !== JSON.stringify(expectedLocation)) {
                console.log("Error: " + e);
                console.log(errors.map(error => compiler.toConsoleMessage(error, sources)).join("\n"));
            }
            assert.deepEqual(actualLocation, expectedLocation);
        }
        else {
            throw e;
        }
    }
}

export async function test() {
// await testCompileError(
// `
// struct Integer
// struct Number
//                 ||| error
// var y: Number = 231
// `);

await testCompileError(
`
struct Integer
                |||| can not satisfy
function bar(a: >= 0)
    a = -1
    return a
`);

// await testCompileError(
// `
// struct Integer
// bar = (a: 0 .. 3) =>
//        ||||| test will always fail
//     if a < 0
//         return a
//     return a
// `);

// await testCompileError(
// `
// struct Integer
// bar = (a: 0 .. 3) =>
//        ||||||||||||||| test will always pass
//     if a > -1 && a < 4
//         return a
//     return a
// `);

// // await testCompileError(`
// // let a = b
// // let b = a
// // `, 1, 4, 1, 5);

// // await testCompileError(`
// // let a = a
// // `, 1, 8, 1, 9);

}
