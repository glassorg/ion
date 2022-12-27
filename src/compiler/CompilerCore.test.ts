import path = require("path");
import { Compiler } from "./Compiler";
import { NodeFileSystem } from "./filesystem/NodeFileSystem";

const ionCoreFolder = path.resolve(path.join(__dirname, "../../src/ion"));

async function testCompile() {
    const debug = true;
    let compiler = new Compiler(new NodeFileSystem(ionCoreFolder), { debugPattern: debug ? /.*/ : undefined });
    let declarations = await compiler.compileAllFiles();
    console.log(declarations.map(d => d.absolutePath));
}

testCompile().then(() => {
    console.log("*****************************************************************");
    console.log("******************* Compiled Ion Core Library *******************");
    console.log("*****************************************************************");
})
