import Parser from "../parser";
import { Input } from "../Compiler";
import { getFilesRecursive, mapValues } from "../common";

export default function importResolution(input) {
    // find all unresolved names in each module
    input.foo = "bar"
    return input
}
