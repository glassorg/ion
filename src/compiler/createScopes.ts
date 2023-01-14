import { debug } from "console";
import { AstNode } from "./ast/AstNode"
import { Declaration, ParsedDeclaration } from "./ast/Declaration"
import { FunctionDeclaration } from "./ast/FunctionDeclaration";
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
export function createScopes(root: Declaration, externals: ParsedDeclaration[] = []): Scopes {
    let globalScope: Scope = {};
    let map = new Map<AstNode, Scope>();
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

    for (const external of externals) {
        //  always declare the absolute path
        declare(external, external.absolutePath);
        //  if it's a function then we will also always declare it in the global scope as well.
        if (external instanceof FunctionDeclaration && external.absolutePath !== external.id.name) {
            // external functions are always declared in the global scope.
            declare(external);
        }
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
