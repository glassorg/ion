import { Assembly } from "../ast";
import File from "../ast/File";
import { Options } from "../Compiler";
import np from "path";
import { read, exists } from "../common";
const escodegen = require("../../external/escodegen");

export const verbatim = "verbatim"

export function codegen(ast) {
    return escodegen.generate(ast, { verbatim })
}

export default function toJavascriptFiles(ast: Assembly, options: Options) {
    return new Assembly({
        files: Object.keys(ast.modules).map(name => {
            let checkNativeFile = np.join(options.input, name.replace(".", np.sep) + ".ts");
            let module = ast.modules[name]
            let content = exists(checkNativeFile)
                ? read(checkNativeFile)
                : codegen({ type: "Program", body: module.declarations });
            return new File({
                path: name.replace('.', '/') + '.ts',
                content
            })
        })
    })

}