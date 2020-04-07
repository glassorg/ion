import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference } from "../ast";
import { SemanticError } from "../common";

export default function importResolution(root: Assembly) {
    // find all unresolved names in each module
    for (let module of root.modules.values()) {
        let { imports } = module
        let importDeclarations = new Map<string,VariableDeclaration>();
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
                            importDeclarations.set(last.as.name, new VariableDeclaration({
                                location: last.as.location,
                                id: last.as,
                                value: new ExternalReference({
                                    location: last.as.location,
                                    file: path,
                                    name: path.slice(path.lastIndexOf('.') + 1)
                                })
                            }))
                        }
                        else {
                            importPaths.push(path)
                        }
                    }
                }
            }
        })
    
        // now push the declarations into the module.declarations
        //  we want to put it first so we reassign to new object
        module.declarations = new Map([ ...importDeclarations.entries(), ...module.declarations.entries() ])
        importDeclarations.clear()
        //  { ...importDeclarations, ...module.declarations }
        // importDeclarations = {}
    
        let scopes = createScopeMap(module)
        // now let's traverse and find unreferenced modules
        let unresolvedNames = new Map<string,Node>()
        traverse(module, {
            enter(node: Node, ancestors, path) {
                if (Reference.is(node) && !ExternalReference.is(node)) {
                    let ref = node as Reference
                    let scope = scopes.get(ref)
                    let declaration = scope[ref.name]
                    if (declaration == null) {
                        unresolvedNames.set(ref.name, ref)
                    }
                }
            }
        })

        // now try to resolve these unresolved names
        for (let name of unresolvedNames.keys()) {
            let found = false
            for (let path of importPaths) {
                let checkPath = path + name
                // try to resolve it directly to a module for now
                let externalModule = root.modules.get(checkPath)
                if (externalModule != null) {
                    found = true
                    importDeclarations.set(name, new VariableDeclaration({
                        id: new Id({ name }),
                        value: new ExternalReference({
                            file: checkPath,
                            name: checkPath.slice(checkPath.lastIndexOf('.') + 1)
                        })
                    }))
                }
            }
            if (!found) {
                throw SemanticError(`Cannot resolve ${name}`, unresolvedNames.get(name))
            }
        }

        module.declarations = new Map([ ...importDeclarations.entries(), ...module.declarations.entries() ])
        module.imports = []
    }
    return root
}
