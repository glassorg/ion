import { strict as assert } from "assert";
import { Compiler } from "./Compiler";
import { MemoryFileSystem } from "./filesystem/MemoryFileSystem";

let compiler = new Compiler(new MemoryFileSystem({
"foo/bar.ion":
`
let x = 1.0
var y: Number = 2
function max(x: Number, y: Number) =>
    if x > y
        return x
    else if y > x
        return y
    else
        return x
`
}));

const errors = compiler.compileAllFiles();
console.log(errors.map(error => compiler.toConsoleMessage(error)).join("\n"));