import path = require("path");
import { Compiler } from "../Compiler";
import { CacheFileSystem } from "../filesystem/CacheFileSystem";
import { NodeFileSystem } from "../filesystem/NodeFileSystem";

const ionCoreFolder = path.resolve(path.join(__dirname, "../../../src/ion"));

async function testCompile() {
    const debug = true;
    let compiler = new Compiler(
        new CacheFileSystem(new NodeFileSystem(ionCoreFolder)),
        { debugPattern: debug ? /sample/i : undefined }
    );
    let assembly = await compiler.compileAllFiles();
    // console.log(assembly.declarations.map(d => d.absolutePath));
}

testCompile().then(() => {
    console.log("*****************************************************************");
    console.log("******************* Compiled Ion Core Library *******************");
    console.log("*****************************************************************");
});
