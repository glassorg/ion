import np from "path";
import { Assembly } from "../../ast";
import { read, exists } from "../../common";
import { Options } from "../../Compiler";
const escodegen = require("../../../external/escodegen");

export const verbatim = "verbatim"

export function codegen(ast) {
    return escodegen.generate(ast, { verbatim })
}

export default function toJavascriptFiles(root: Assembly, options: Options) {
    let files: { [name: string]: string } = {}
    for (let moduleName in root.modules) {
        let module = root.modules[moduleName]
        let checkNativeFile = np.join(options.input, moduleName.replace(".", np.sep) + ".ts")
        let content = exists(checkNativeFile)
            ? read(checkNativeFile)
            : codegen(module)
        let path = moduleName.replace('.', '/') + '.ts'
        files[path] = content
    }
    return files
}