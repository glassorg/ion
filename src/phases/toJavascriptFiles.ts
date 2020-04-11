import np from "path";
import { Assembly } from "../ast";
import { read, exists } from "../common";
const escodegen = require("../../external/escodegen");

export const verbatim = "verbatim"

export function codegen(ast) {
    return escodegen.generate(ast, { verbatim })
}

export default function toJavascriptFiles(root: Assembly) {
    for (let name of root.modules.keys()) {
        let module = root.modules.get(name)!
        let checkNativeFile = np.join(root.options.input, name.replace(".", np.sep) + ".ts")
        let content = exists(checkNativeFile)
            ? read(checkNativeFile)
            : codegen(module)
        let path = name.replace('.', '/') + '.ts'
        root._outputFiles.set(path, content)
        // now delete the module
        root.modules.delete(name)
    }
}