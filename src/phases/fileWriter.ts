import { Assembly } from "../ast";
import { Options } from "../Compiler";
import { join } from "path";
import { write } from "../common";

export default function fileWriter(ast: Assembly, options: Options) {
    if (ast.files) {
        for (let file of ast.files) {
            write(join(options.output, file.path), file.content)
        }
    }
}