import Assembly from "../ast/Assembly";
import { Options } from "../Compiler";
import Analysis from "../ast/Analysis";
import { getAbsoluteName } from "./importResolution";
import { Declaration, Reference } from "../ast";
import createScopeMap from "../createScopeMap";
import { traverse } from "../Traversal";

export default function convertRefsToAbsolute(root: Assembly, options: Options) {
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
                        let newName = getAbsoluteName(module.id.name, node.name)
                        node.name = newName
                    }
                }
            }
        })
    }
}