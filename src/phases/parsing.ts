import Parser from "../parser";
import { Input } from "../Compiler";
import { getFilesRecursive, mapValues } from "../common";
import Assembly from "../ast/Assembly";
import Module from "../ast/Module";
import Id from "../ast/Id";

let parser = Parser()

export default function parsing(input: Input) {
    let modules = mapValues(
        getFilesRecursive(input.root),
        (source: string, name: string) => {
            let module: Module = parser.parse(source, name)
            module.id = new Id({ location: module.location, name })
            return module
        }
    )
    return new Assembly({ modules })
}
