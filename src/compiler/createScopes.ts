import { Assembly } from "./ast/Assembly";
import { AstNode } from "./ast/AstNode";
import { Declaration } from "./ast/Declaration"
import { FunctionExpression } from "./ast/FunctionExpression";
import { isScopeNode } from "./ast/ScopeNode";
import { traverse } from "./common/traverse";
import { isSSAVersionName } from "./phases/assembly/ssaForm";

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
    let nodeThatCreatedScope = new Map<Scope, AstNode>();

    function getFunctionScope() {
        for (let i = scopes.length - 1; i >= 0; i--) {
            let scope = scopes[i];
            let node = nodeThatCreatedScope.get(scope);
            if (node instanceof FunctionExpression) {
                return scope;
            }
        }
        throw new Error(`Function scope not found`);
    }

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

        if (isSSAVersionName(name)) {
            const functionScope = getFunctionScope();
            //  SSA variables must be put in function scope so they can be used by
            //  PHI functions that reference the variables from previous conditionals
            functionScope[name] = value;
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

            if (isScopeNode(node)) {
                scopes.push(scope = Object.create(scope));
                nodeThatCreatedScope.set(scope, node);
            }
        },
        leave(node) {
            if (isScopeNode(node)) {
                scopes.pop();
            }
        }
    });

    return map as Scopes;
}
