import Assembly from "../ast/Assembly";
import createScopeMap from "../createScopeMap";
import { traverse } from "../Traversal";
import { TypeDeclaration, VariableDeclaration, ClassDeclaration, Module, Reference, ExternalReference } from "../ast";
import { SemanticError } from "../common";
import { getExternalReferenceName } from "../ast/ExternalReference";

export default function declarationIsolation(root: Assembly) {
    // we are going to extract all declarations from modules and put them into the assembly declarations map
    for (let moduleName of root.modules.keys()) {
        let module = root.modules.get(moduleName)!
        let declarations = module.declarations!
        // now create a scope map
        let scopes = createScopeMap(module)
        // ALL inter declaration references must be converted to external references.
        traverse(module, {
            leave(node) {
                if (Reference.is(node) && !ExternalReference.is(node)) {
                    let ref = node as Reference
                    let scope = scopes.get(ref)
                    let referencedDeclaration = scope[ref.name]
                    if (declarations.has(ref.name)) {
                        // return with external reference (even if it's referencing a containing root module declaration)
                        return new ExternalReference({ file: module.id.name, export: ref.name, location: ref.location })
                    }
                }
            }
        })
    }
}