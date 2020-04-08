import Assembly from "../ast/Assembly";
import createScopeMap from "../createScopeMap";
import { traverse } from "../Traversal";
import { TypeDeclaration, VariableDeclaration, ClassDeclaration, Module, Reference, ExternalReference } from "../ast";
import { SemanticError } from "../common";
import { getExternalReferenceName } from "../ast/ExternalReference";

export default function declarationMigration(root: Assembly) {
    for (let moduleName of root.modules.keys()) {
        let module = root.modules.get(moduleName)!
        // move all declarations into the assembly declarations
        for (let declarationName of module.declarations.keys()) {
            let declaration = module.declarations.get(declarationName)!
            let externalName = getExternalReferenceName(moduleName, declarationName)
            // we also have to change the declarations .id.name
            declaration.id.name = externalName
            root.declarations.set(externalName, declaration)
        }
        module.declarations.clear()
    }
}