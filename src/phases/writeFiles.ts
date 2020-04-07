import { Assembly } from "../ast";
import { join } from "path";
import { write } from "../common";

export default function writeFiles(ast: Assembly) {
    if (ast.outputFiles) {
        for (let path of ast.outputFiles.keys()) {
            let content = ast.outputFiles.get(path)!
            write(join(ast.options.output, path), content)
        }
    }
}