import { ParsedDeclaration } from "../ast/Declaration";
import { Reference } from "../ast/Reference";
import { joinPath, splitPath } from "../common/pathFunctions";
import { traverse } from "../common/traverse";
import { createScopes } from "../createScopes";

export function *getPossiblePaths(fromPath: string, unresolvedName: string) {
    let basePath = splitPath(fromPath).slice(0, -1);
    while (basePath.length > 0) {
        yield joinPath(...basePath, unresolvedName);
    }
    return unresolvedName;
}

export async function getPossibleExternalReferences(declaration?: ParsedDeclaration): Promise<string[]> {
    if (!declaration) {
        return [];
    }
    let externals = new Set<string>();
    // resolve externals.
    let scopes = createScopes(declaration);
    traverse(declaration, {
        enter(node) {
            if (node instanceof Reference) {
                let scope = scopes.get(node);
                let declaration = scope[node.name];
                if (!declaration) {
                    externals.add(node.name);
                }
            }
        }
    })
    const result = [...externals].sort().map(external => [...getPossiblePaths(declaration.absolutePath, external)]).flat();
    console.log({ path: declaration.absolutePath, result })
    return result;
}