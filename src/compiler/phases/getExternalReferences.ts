import { Declaration } from "../ast/Declaration";
import { Reference } from "../ast/Reference";
import { traverse } from "../common/traverse";
import { createScopes } from "../createScopes";
import { SemanticError } from "../SemanticError";

export function getExternalReferences(declaration: Declaration): [Map<string,Reference[]>, SemanticError[]] {
    let externals = new Map<string,Reference[]>();
    function addExternal(ref: Reference) {
        let refs = externals.get(ref.name);
        if (!refs) {
            externals.set(ref.name, refs = []);
        }
        refs.push(ref);
    }
    let errors: SemanticError[] = [];
    // resolve externals.
    let scopes = createScopes(declaration);
    traverse(declaration, {
        enter(node) {
            if (node instanceof Reference) {
                let scope = scopes.get(node);
                let declaration = scope[node.name];
                if (!declaration) {
                    addExternal(node);
                }
            }
        }
    })

    return [externals, errors];
}