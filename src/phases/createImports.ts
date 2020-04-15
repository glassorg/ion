import Assembly from "../ast/Assembly";
import { traverse, setValue, skip } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, Declaration, Location, MemberExpression } from "../ast";
import { getExternalModuleNameAndExportName, getLastName } from "../common";
import IdGenerator from "../IdGenerator";
import ImportDeclaration from "../ast/ImportDeclaration";

export default function createImports(root: Assembly) {

    // find all external references
    for (let moduleName in root.modules) {
        let module = root.modules[moduleName]

        // external module name => Reference => local name
        let externalReferences = new Map<string,Map<Reference,string>>()
        // valid identifiers, so we don't generate a collision
        let idGenerator = new IdGenerator()

        traverse(module, {
            enter(node) {
                if (Reference.is(node)) {
                    return skip
                }
            },
            leave(node) {
                if (Reference.is(node)) {
                    let externalModuleAndName = getExternalModuleNameAndExportName(node.name)
                    if (externalModuleAndName) {
                        let [moduleName, exportName] = externalModuleAndName
                        let refs = externalReferences.get(moduleName)
                        if (refs == null) {
                            externalReferences.set(moduleName, refs = new Map())
                        }
                        // these are external references, so let's fix the locals and then add the imports.
                        let newModuleReferenceNode = new Reference({ name: "determinedLater" })
                        // save this so we can fix it later
                        refs.set(newModuleReferenceNode, exportName)
                        // change these references to 
                        return new MemberExpression({
                            object: newModuleReferenceNode,
                            property: new Id({ name: exportName })
                        })
                    }
                    else {
                        idGenerator.ids.add(node.name)
                    }
                }
            }
        })
        // now, create imports and change the references.
        let newImports: Declaration[] = []
        for (let externalModuleName of externalReferences.keys()) {
            let localName = idGenerator.createNewIdName(getLastName(externalModuleName))
            newImports.push(
                new ImportDeclaration({
                    id: new Id({
                        name: localName
                    }),
                    from: externalModuleName
                })
            )
            // now fix all of the current references
            let refs = externalReferences.get(externalModuleName)!
            for (let ref of refs?.keys()) {
                ref.name = localName
            }
        }
        // finally, push these imports into the start of the module declarations
        module.declarations.unshift(...newImports)
    }

}
