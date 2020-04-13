import Input from "../ast/Input";
import Module from "../ast/Module";
import Id from "../ast/Id";
import { Options } from "../Compiler";

export default function parsing(root: { [name: string]: string }, options: Options) {
    let modules: { [name: string]: Module } = {}
    for (let name in root) {
        let source = root[name]
        let module: Module = options.parser.parse(source, name)
        module.id = new Id({ location: module.location, name })
        modules[name] = module 
    }
    return new Input({ modules })
}
