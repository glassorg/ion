import { Assembly } from "../ast";
import { join } from "path";
import { write } from "../common";

export default function writeFiles(ast: Assembly) {
    if (ast._outputFiles) {
        for (let path of ast._outputFiles.keys()) {
            let content = ast._outputFiles.get(path)!
            write(join(ast.options.output, path), content)
        }
    }
}