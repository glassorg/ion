import { strict as assert } from "assert"
import Compiler from "../Compiler";
import path from "path";

let compiler = new Compiler()
let result = compiler.compile({
    input: path.join(__dirname, "../../ionsrc"),
    output: path.join(__dirname, "../../dist"),
})
assert(true)
