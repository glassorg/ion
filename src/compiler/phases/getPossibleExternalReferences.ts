import { ParsedDeclaration } from "../ast/Declaration";
import { Reference } from "../ast/Reference";
import { joinPath, splitPath } from "../common/pathFunctions";
import { traverse } from "../common/traverse";
import { createScopes } from "../createScopes";

export function getPossiblePaths(fromPath: string, unresolvedName: string): string[] {
    let paths: string[] = [];
    let basePath = splitPath(fromPath).slice(0, -1);
    while (basePath.length > 0) {
        paths.push(joinPath(...basePath, unresolvedName));
        basePath.pop();
    }
    paths.push(unresolvedName);
    return paths;
}

export async function getPossibleExternalReferences(declaration: ParsedDeclaration): Promise<string[]> {
    let externals = new Set<string>();
    // resolve externals.
    let scopes = createScopes(declaration);
    declaration = traverse(declaration, {
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
    const result = [...externals].sort().map(external => getPossiblePaths(declaration.absolutePath, external)).flat();
    return result;
}