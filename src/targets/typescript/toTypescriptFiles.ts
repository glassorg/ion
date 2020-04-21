import fs from "fs";
import path from "path";
import { Assembly } from "../../ast";
import { read, exists } from "../../common";
import { Options } from "../../Compiler";
const escodegen = require("../../../external/escodegen");

export const verbatim = "verbatim"

export function codegen(ast) {
    return escodegen.generate(ast, { verbatim, comment: true })
}

export function getNativeFile(moduleName: string, options: Options): string | null {
    for (let input of options.inputs) {
        let filename = path.join(input, moduleName.replace('.', path.sep) + ".ts")
        if (exists(filename)) {
            return filename;
        }
    }
    return null;
}

export function removePrewritten(root: Assembly, options: Options) {
    for (let moduleName in root.modules) {
        let nativeFile = getNativeFile(moduleName, options)
        if (nativeFile) {
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
        let nativeFile = getNativeFile(moduleName, options)
        let content = nativeFile ? read(nativeFile) : codegen(module)
        let outputFile = moduleName.replace('.', '/') + '.ts'
        files[outputFile] = content
    }
    return files
}