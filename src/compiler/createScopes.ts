import { AstNode } from "./ast/AstNode"
import { Declaration } from "./ast/Declaration"
import { isScope } from "./ast/Scope";
import { traverse } from "./common/traverse";

export interface Scope {
    [id: string]: Declaration[]
}
export interface Scopes {
    get(node: AstNode): Scope
}

/**
 * Returns a Map which will contain a scope object with variable names returning Declarations.
 * @param root the ast
 */
export function createScopes(root: Declaration, externals: Declaration[] = []): Scopes {
    let globalScope: Scope = {};
    let map = new Map<AstNode, Scope>();
    let scopes: Scope[] = [globalScope];

    const declare = (declaration: Declaration) => {
        let scope = scopes[scopes.length - 1];
        (scope[declaration.id.name] ??= []).push(declaration);
    }

    for (const external of externals) {
        declare(external);
    }

    traverse(root, {
        enter(node) {
            //  get the current scope
            let scope = scopes[scopes.length - 1];
            //  save a map from this nodes location to it's scope
            map.set(node, scope);

            if (node instanceof Declaration) {
                declare(node);
            }

            if (isScope(node)) {
                scopes.push(scope = Object.create(scope));
            }
        },
        leave(node) {
            if (isScope(node)) {
                scopes.pop();
            }
        }
    });

    return map as Scopes;
}
