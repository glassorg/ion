import Input from "../ast/Input";
import { Options } from "../Compiler";
import Analysis from "../ast/Analysis";
import { getExportName } from "./importResolution";
import { Declaration, Reference } from "../ast";
import createScopeMap from "../createScopeMap";
import { traverse } from "../Traversal";

export default function inputToAnalysis(root: Input, options: Options): Analysis {

    //  First we convert any refences to other declarations within the same module
    //  into absolute references
    for (let moduleName in root.modules) {
        let module = root.modules[moduleName]
        // now create a scope map
        let scopes = createScopeMap(module)
        // ALL inter declaration references must be converted to external references.
        traverse(module, {
            leave(node) {
                if (Reference.is(node)) {
                    let scope = scopes.get(node)
                    let isInternal = scope[node.name] != null
                    if (isInternal) {
                        let newName = getExportName(module.id.name, node.name)
                        node.name = newName
                    }
                }
            }
        })
    }

    //  Then we extract all declarations out
    let declarations: { [name: string]: Declaration } = {}
    for (let moduleName in root.modules) {
        let module = root.modules[moduleName]
        // move all declarations into the assembly declarations
        for (let declaration of module.declarations) {
            let exportName = getExportName(moduleName, declaration.id.name)
            // we also have to change the declarations .id.name
            declaration.id.name = exportName
            declarations[exportName] = declaration
        }
    }

    //  And finally create the new Analysis scope
    return new Analysis({ declarations })
}