import { Assembly } from "./ast/Assembly";
import { AstNode } from "./ast/AstNode";
import { Declaration } from "./ast/Declaration"
import { isScope } from "./ast/Scope";
import { traverse } from "./common/traverse";

export interface Scope {
    [id: string]: Declaration[]
}
export interface Scopes {
    get(node: string): Scope
}

export const globalScopeKey = "";

/**
 * Returns a Map which will contain a scope object with variable names returning Declarations.
 * @param root the ast
 */
export function createScopes(root: Assembly): Scopes {
    let globalScope: Scope = {};
    let map = new Map<string, Scope>([[globalScopeKey, globalScope]]);
    let scopes: Scope[] = [globalScope];
    let getDeclarationArraysOriginalScope = new Map<Declaration[], Scope>();

    function declare(declaration: Declaration, name = declaration.id.name, currentScope = scopes[scopes.length - 1]) {
        let value: Declaration[] | undefined = currentScope[name];
        let originalScope = getDeclarationArraysOriginalScope.get(value);
        if (value && currentScope === originalScope) {
            value.push(declaration);
        }
        else {
            currentScope[name] = value = [...(value ?? []), declaration];
            getDeclarationArraysOriginalScope.set(value, currentScope);
        }
    }

    traverse(root, {
        enter(node) {
            if (!(node instanceof AstNode)) {
                return;
            }

            //  get the current scope
            let scope = scopes[scopes.length - 1];
            //  save a map from this nodes location to it's scope
            map.set(node.scopeKey, scope);

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
