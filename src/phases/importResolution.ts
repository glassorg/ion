import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, setValue } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, Declaration, Location } from "../ast";
import { SemanticError } from "../common";

export function isTypeReference(node): node is Reference {
    if (!Reference.is(node)) {
        return false
    }
    let first = getLastName(node.name)[0]
    return first === first.toUpperCase()
}

export function getLastName(absoluteName: string) {
    return absoluteName.slice(absoluteName.lastIndexOf('.') + 1)
}

export function getAbsoluteName(moduleName: string, declarationName: string) {
    let lastName = getLastName(moduleName)
    if (lastName === declarationName) {
        return moduleName
    }
    return moduleName + "." + declarationName
}

export function getExternalModuleNameAndExportName(root: Assembly, absoluteName: string): [string, string] | null {
    let lastName = getLastName(absoluteName)
    if (lastName === absoluteName) {
        // this is not an external reference, so return null
        return null
    }
    if (root.modules[absoluteName] != null) {
        // this is a default export
        return [ absoluteName, "default" ]
    }
    let moduleName = absoluteName.slice(0, absoluteName.length - lastName.length - 1)
    return [ moduleName, lastName ]
}

export function getLocalName(absoluteName: string, localModuleName: string) {
    let local = absoluteName === localModuleName ||
        (absoluteName.startsWith(localModuleName) && absoluteName[localModuleName.length] === '.')
    return local ? getLastName(absoluteName) : null
}

function getAllExports(root: Assembly) {
    let names: { [name: string]: true } = {}
    for (let moduleName in root.modules) {
        names[moduleName] = true
        let module = root.modules[moduleName]
        for (let declaration of module.declarations) {
            let declarationName = declaration.id.name
            names[getAbsoluteName(moduleName, declarationName)] = true
        }
    }
    return names
}

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
                        let path = steps.map(step => step.id ? step.id.name : "").join(".")
                        if (steps[0].relative) {
                            path = module.id.name.split('.').slice(0, -1).concat([path]).join('.')
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
                let newName = path + name
                if (exports[newName]) {
                    found = true
                    resolveReferences(name, newName)
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
