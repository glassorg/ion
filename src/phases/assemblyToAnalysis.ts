import Assembly from "../ast/Assembly";
import { Options } from "../Compiler";
import Analysis from "../ast/Analysis";
import { getAbsoluteName } from "./importResolution";
import { Declaration, Reference } from "../ast";
import createScopeMap from "../createScopeMap";
import { traverse } from "../Traversal";

export default function assemblyToAnalysis(root: Assembly, options: Options): Analysis {

    //  Then we extract all declarations out
    let declarations: { [name: string]: Declaration } = {}
    for (let moduleName in root.modules) {
        let module = root.modules[moduleName]
        // move all declarations into the assembly declarations
        for (let declaration of module.declarations) {
            let exportName = getAbsoluteName(moduleName, declaration.id.name)
            // we also have to change the declarations .id.name
            declaration.id.name = exportName
            declarations[exportName] = declaration
        }
    }

    //  And finally create the new Analysis scope
    return new Analysis({ declarations })
}