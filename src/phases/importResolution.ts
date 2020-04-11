import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, setValue } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, Declaration, Location } from "../ast";
import { SemanticError } from "../common";
import { getExternalReferenceName } from "../ast/Reference";

export default function importResolution(root: Assembly) {
    type AsReference = {
        file: string,
        export: string
    }

    let asReferences = new Map<string, AsReference>()

    // find all unresolved names in each module
    for (let module of root.modules.values()) {
        let { imports } = module
        let importDeclarations = new Map<string,Declaration>();
        let importPaths: string[] = []
        traverse(imports, {
            enter(node, ancestors) {
                if (ImportStep.is(node)) {
                    let last = node as ImportStep
                    if (last.as || last.children === true) {
                        let steps = ancestors.filter(node => ImportStep.is(node)).concat([last]) as ImportStep[]
                        let path = steps.map(step => step.id ? step.id.name : "").join(".")
                        if (steps[0].relative) {
                            path = module.id.name.split('.').slice(0, -1).concat([path]).join('.')
                        }
                        if (last.as) {
                            // This will NOT stand, man.
                            // We MUST find these AS references and convert them to direct external references.
                            asReferences.set(last.as.name, { file: path, export: path.slice(path.lastIndexOf('.') + 1)})
                            // importDeclarations.set(last.as.name, new VariableDeclaration({
                            //     location: last.as.location,
                            //     id: last.as,
                            //     value: new Reference({
                            //         location: last.as.location,
                            //         file: path,
                            //         name: path.slice(path.lastIndexOf('.') + 1)
                            //     })
                            // }))
                        }
                        else {
                            importPaths.push(path)
                        }
                    }
                }
            }
        })
    
        // now push the declarations into the module.declarations
        importDeclarations.clear()
    
        let scopes = createScopeMap(module)
        // now let's traverse and find unreferenced modules
        type UnresolvedReference = {
            ref: Reference,
            key: any
            parent: any,
        }
        let unresolvedReferences = new Map<string,UnresolvedReference[]>()
        traverse(module, {
            enter(node: Node, ancestors, path) {
                if (Reference.is(node) && !node.isExternal()) {
                    let ref = node as Reference
                    let scope = scopes.get(ref)
                    let declaration = scope[ref.name]
                    if (declaration == null) {
                        let refs = unresolvedReferences.get(ref.name)
                        if (refs == null) {
                            unresolvedReferences.set(ref.name, refs = [])
                        }
                        refs.push({ ref, key: path[path.length - 1], parent: ancestors[ancestors.length - 1] })
                    }
                }
            }
        })

        function resolveReferences(name, file, exportName) {
            for (let uref of unresolvedReferences.get(name)!) {
                // let's replace references with external references.
                setValue(uref.parent, uref.key, new Reference({
                    name: getExternalReferenceName(file, exportName),
                    location: uref.ref.location
                }))
            }
        }

        // now try to resolve these unresolved names
        for (let name of unresolvedReferences.keys()) {
            let found = false
            for (let path of importPaths) {
                let file = path + name
                // try to resolve it directly to a module for now
                let externalModule = root.modules.get(file)
                if (externalModule != null) {
                    found = true
                    // instead of this let's change ALL references into external references.
                    let _export = file.slice(file.lastIndexOf('.') + 1) // for now, only importing main export TODO: others.
                    resolveReferences(name, file, _export)
                }
            }
            if (!found) {
                // see if we can find within asReferences
                let asref = asReferences.get(name)
                if (asref) {
                    resolveReferences(name, asref.file, asref.export)
                }
                else {
                    throw SemanticError(`Cannot resolve ${name}`, unresolvedReferences.get(name)![0].ref)
                }
            }
        }

        module.imports = []
    }
    return root
}
