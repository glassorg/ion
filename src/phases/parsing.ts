import Parser from "../parser";
import { Input } from "../Compiler";
import { getFilesRecursive, mapValues } from "../common";

let parser = Parser()

export default function parsing(input: Input) {
    let files = mapValues(
        getFilesRecursive(input.root),
        (source, filename) => parser.parse(source, filename)
    )
    return { ...input, files }
}
