import { strict as assert } from "assert"
import Compiler from "../Compiler";
import path from "path";

let compiler = new Compiler()
let result = compiler.compile({ root: path.join(__dirname, "../../ionsrc") })
assert(true)
