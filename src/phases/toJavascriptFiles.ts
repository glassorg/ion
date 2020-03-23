import { Assembly } from "../ast";
import escodegen from "escodegen";
import File from "../ast/File";

export const verbatim = "verbatim"

export default function toJavascriptFiles(ast: Assembly) {
    return new Assembly({
        files: Object.keys(ast.modules).map(name => {
            let module = ast.modules[name]
            return new File({
                path: name.replace('.', '/') + '.js',
                content: escodegen.generate({
                    type: "Program",
                    body: module.declarations
                }, {
                    verbatim
                })
            })
        })
    })

}