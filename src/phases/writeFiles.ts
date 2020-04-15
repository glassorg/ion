import { Assembly } from "../ast";
import { join } from "path";
import { write } from "../common";
import { Options } from "../Compiler";

export default function writeFiles(ast: { [name: string]: string }, options: Options) {
    for (let path in ast) {
        let content = ast[path]
        write(join(options.output, path), content)
    }
    return null
}