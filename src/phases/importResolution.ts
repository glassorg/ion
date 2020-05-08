import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
// import { Module, Node, Reference, Id, ImportStep, Declaration, Location } from "../ast";
import { SemanticError, getAllExports, PATH_SEPARATOR, EXPORT_DELIMITER } from "../common";
import ImportStep from "../ast/ImportStep";
import Reference from "../ast/Reference";
import Module from "../ast/Module";

export default function importResolution(root: Assembly) {
    let asReferences = new Map<string, string>()

    // let's first find ALL valid external names
    let exports = getAllExports(root)

    // we store intended reference replacements
    // and then replace them in a final traversal
    let replace = new Map<Reference,Reference>()

    // find all unresolved names in each module
    for (let name of root.modules.keys()) {
        const module = root.modules.get(name)!
        let { imports } = module
        let importPaths: string[] = []
        traverse(imports, {
            enter(node, ancestors) {
                if (ImportStep.is(node)) {
                    if (node.as || node.children === true) {
                        let steps = ancestors.filter(a => ImportStep.is(a)).concat([node]) as ImportStep[]
                        let path = steps.map(step => step.id ? step.id.name : "").filter(n => n.length).join(".")
                        if (steps[0].relative) {
                            path = name.split(PATH_SEPARATOR).slice(0, -1).concat([path]).filter(n => n.length).join(PATH_SEPARATOR)
                        }
                        if (node.as) {
                            // We MUST find these AS references and convert them to direct external references.
                            asReferences.set(node.as.name, path)
                        }
                        if (node.children === true) {
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
                //  patch function would be cool as it would construct
                //  the correct class if this is a subclass
                replace.set(ref, ref.patch({ ...ref, name: newName }))
            }
        }

        // now try to resolve these unresolved names
        for (let name of unresolvedReferences.keys()) {
            let found = false
            for (let path of importPaths) {
                let checkPaths = [
                    path + EXPORT_DELIMITER + name,
                    path + (path.length ? PATH_SEPARATOR : "") + name + EXPORT_DELIMITER + name
                ]
                for (let checkPath of checkPaths) {
                    // let newName = path + name
                    if (exports.has(checkPath)) {
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

    }

    // finally we replace all references
    return traverse(root, {
        leave(node) {
            if (Module.is(node)) {
                return new Module({ ...node, imports: [] })
            }
            return replace.get(node) ?? node
        }
    })
}
