import { Options } from "../Compiler";
import { getFilesRecursive, mapValues } from "../common";
import Assembly from "../ast/Assembly";
import Module from "../ast/Module";
import Id from "../ast/Id";

export default function parsing(input: Options, files, parser) {
    let modules = mapValues(
        files,
        (source: string, name: string) => {
            let module: Module = parser.parse(source, name)
            module.id = new Id({ location: module.location, name })
            return module
        }
    )
    return new Assembly({ modules })
}
