import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, setValue } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference, Declaration, Location } from "../ast";
import { SemanticError } from "../common";

export default function checkReferences(root: Assembly) {
    let scopes = createScopeMap(root)
    traverse(root, {
        enter(node) {
            if (Reference.is(node)) {
                let ref = node as Reference
                let scope = scopes.get(ref)
                let declaration = scope[ref.name]
                if (declaration == null) {
                    throw SemanticError(`Reference not found: ${ref.name}`, ref)
                }
            }
        }
    })
    return root
}
