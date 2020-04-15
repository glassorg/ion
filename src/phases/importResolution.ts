import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, setValue } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, Declaration, Location } from "../ast";
import { SemanticError, getAllExports, PATH_SEPARATOR, EXPORT_DELIMITER } from "../common";

export default function importResolution(root: Assembly) {
    let asReferences = new Map<string, string>()

    // let's first find ALL valid external names
    let exports = getAllExports(root)

    // find all unresolved names in each module
    for (let name in root.modules) {
        let module = root.modules[name]
        let { imports } = module
        let importPaths: string[] = []
        traverse(imports, {
            enter(node, ancestors) {
                if (ImportStep.is(node)) {
                    let last = node as ImportStep
                    if (last.as || last.children === true) {
                        let steps = ancestors.filter(node => ImportStep.is(node)).concat([last]) as ImportStep[]
                        let path = steps.map(step => step.id ? step.id.name : "").filter(n => n.length).join(".")
                        if (steps[0].relative) {
                            path = module.id.name.split(PATH_SEPARATOR).slice(0, -1).concat([path]).filter(n => n.length).join(PATH_SEPARATOR)
                        }
                        if (last.as) {
                            // We MUST find these AS references and convert them to direct external references.
                            asReferences.set(last.as.name, path)
                        }
                        if (last.children === true) {
                            importPaths.push(path)
                        }
                    }
                }
            }
        })
    
        let scopes = createScopeMap(module)
        // now let's traverse and find unreferenced modules
        let unresolvedReferences = new Map<string,Reference[]>()

        traverse(module, {
            enter(node: Node) {
                if (Reference.is(node)) {
                    let scope = scopes.get(node)
                    let declaration = scope[node.name]
                    if (declaration == null) {
                        let refs = unresolvedReferences.get(node.name)
                        if (refs == null) {
                            unresolvedReferences.set(node.name, refs = [])
                        }
                        refs.push(node)
                    }
                }
            }
        })

        function resolveReferences(oldName, newName) {
            for (let ref of unresolvedReferences.get(oldName)!) {
                ref.name = newName
            }
        }

        // now try to resolve these unresolved names
        for (let name of unresolvedReferences.keys()) {
            let found = false
            for (let path of importPaths) {
                let checkPaths = [path + EXPORT_DELIMITER + name, path + PATH_SEPARATOR + name + EXPORT_DELIMITER + name]
                for (let checkPath of checkPaths) {
                    // let newName = path + name
                    if (exports[checkPath]) {
                        found = true
                        resolveReferences(name, checkPath)
                    }
                }
            }
            if (!found) {
                // see if we can find within asReferences
                let asref = asReferences.get(name)
                if (asref) {
                    resolveReferences(name, asref)
                }
                else {
                    throw SemanticError(`Cannot resolve ${name}`, unresolvedReferences.get(name)![0])
                }
            }
        }

        module.imports = []
    }
    return root
}
