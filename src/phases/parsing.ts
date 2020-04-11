import { getInputFilesRecursive, mapValues } from "../common";
import Assembly from "../ast/Assembly";
import Module from "../ast/Module";
import Id from "../ast/Id";

export default function parsing(root: Assembly) {
    root.modules = mapValues(
        root._inputFiles!,
        (source: string, name: string) => {
            let module: Module = root._parser.parse(source, name)
            module.id = new Id({ location: module.location, name })
            return module
        }
    )
}
