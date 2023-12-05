#!/usr/bin/env node
const path = require("path");
const { commandLine } = require("../lib/compiler/commandLine")
const fs = require("fs");
const [, , ...inputs] = process.argv;

if (inputs.length !== 1) {
    //  if they don't provide a command then we display usage and available commands
    console.log(
        `
    Usage: ionc config.json

    # format
    {
        "input": {
            "ns1": "./path/to/ns1/root",
            "ns2": "./path/to/ns2/root"
        },
        "output": {
            "root": "./path/to/output",
            "jsonschema": false,
            "typescript": false,
        }
    }
`);
    return 1
}

const filename = inputs[0];

if (!fs.existsSync(filename)) {
    console.log(`
    ${filename} does not exist.
`);
    return;
}
const content = fs.readFileSync(filename, "utf8");
try {
    const config = JSON.parse(content);
    commandLine(config);
} catch (e) {
    console.log(`
    ${filename} has invalid format: ${e}
`)
}

// // always add our local ionsrc directory to the inputs
// inputs.push(path.join(__dirname, "..", "ionsrc"));
// const { default: Compiler, Options } = require("../lib/Compiler");
// let options = new Options(inputs, output);
// // let logger = (names, ast) => { console.log(names) };
// let compiler = new Compiler();
// compiler.compile(options);
// return 0;
