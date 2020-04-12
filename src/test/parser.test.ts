import { strict as assert } from "assert"
import Compiler, { Options } from "../Compiler";
import path from "path";

let compiler = new Compiler()
let result = compiler.compile(
    new Options(
        path.join(__dirname, "../../ionsrc"),
        path.join(__dirname, "../../dist"),
    )
)
assert(true)
