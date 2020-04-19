import path from "path";
import { Assembly } from "../../ast";
import { read, exists } from "../../common";
import { Options } from "../../Compiler";
const escodegen = require("../../../external/escodegen");

export const verbatim = "verbatim"

export function codegen(ast) {
    return escodegen.generate(ast, { verbatim, comment: true })
}

export function getNativeFile(moduleName: string, options: Options) {
    return path.join(options.input, moduleName.replace('.', path.sep) + ".ts")
}

export function removePrewritten(root: Assembly, options: Options) {
    for (let moduleName in root.modules) {
        let checkNativeFile = getNativeFile(moduleName, options)
        if (exists(checkNativeFile)) {
            let module = root.modules[moduleName]
            // just remove all declarations
            module.declarations = []
        }
    }
}

export default function toTypescriptFiles(root: Assembly, options: Options) {
    let files: { [name: string]: string } = {}
    for (let moduleName in root.modules) {
        let module = root.modules[moduleName]
        let checkNativeFile = getNativeFile(moduleName, options)
        let content = exists(checkNativeFile)
            ? read(checkNativeFile)
            : codegen(module)
        let outputFile = moduleName.replace('.', '/') + '.ts'
        files[outputFile] = content
    }
    return files
}