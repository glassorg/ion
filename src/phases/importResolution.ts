import createScopeMaps from "../createScopeMaps";
import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
// import { Module, Node, Reference, Id, ImportStep, Declaration, Location } from "../ast";
import { SemanticError, getAllExports, PATH_SEPARATOR, EXPORT_DELIMITER, joinPath, isAbsoluteName } from "../common";
import ImportStep from "../ast/ImportStep";
import Reference from "../ast/Reference";
import Module from "../ast/Module";

export default function importResolution(root: Assembly) {
    let asReferences = new Map<string, string>()

    // let's first find ALL valid external names
    let exports = getAllExports(root)
    console.log({ exports })

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
                        let path = steps.map(step => step.id?.name ?? "").filter(n => n.length).join(".")
                        if (steps[0].relative) {
                            let lastIndex = name.lastIndexOf(PATH_SEPARATOR)
                            let relativePath = lastIndex >= 0 ? name.slice(0, lastIndex) : name
                            path = joinPath(relativePath, path)
                        }
                        if (node.as) {
                            // We MUST find these AS references and convert them to direct external references.
                            console.log(">>>>>>>>>>", { as: node.as.name, path, lastId: node.id?.name })
                            asReferences.set(node.as.name, path + EXPORT_DELIMITER + node.id?.name)
                        }
                        if (node.children === true) {
                            importPaths.push(path)
                        }
                    }
                }
            }
        })

   
        let scopes = createScopeMaps(module)
        // now let's traverse and find unreferenced modules
        let unresolvedReferences = new Map<string,Reference[]>()

        traverse(module, {
            enter(node: Node) {
                if (Reference.is(node)) {
                    if (!isAbsoluteName(node.name)) {
                        // we are NOT checking absolute names right now.
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
            }
        })

        // let debug = importPaths.includes("sample")

        function resolveReferences(oldName, newName) {
            for (let ref of unresolvedReferences.get(oldName)!) {
                replace.set(ref, ref.patch({ name: newName }))
            }
        }

        // now try to resolve these unresolved names
        for (let name of unresolvedReferences.keys()) {
            let found = false
            for (let path of importPaths) {
                let checkPaths = [
                    path + EXPORT_DELIMITER + name,
                    joinPath(path, name) + EXPORT_DELIMITER + name
                ]
                // if (debug) {
                    // console.log({ importPaths, unresolvedReferences, checkPaths, exports })
                // }
                for (let checkPath of checkPaths) {
                    // let newName = path + name
                    if (exports.has(checkPath)) {
                        found = true
                        console.log("???????", { name, checkPath })
                        resolveReferences(name, checkPath)
                    }
                }
            }
            if (!found) {
                // see if we can find within asReferences
                let asref = asReferences.get(name)
                if (asref) {
                    // this name needs to be an as reference
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
