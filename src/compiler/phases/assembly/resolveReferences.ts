import { Assembly } from "../../ast/Assembly";
import { Reference } from "../../ast/Reference";
import { traverse } from "../../common/traverse";
import { createScopes } from "../../createScopes";
import { SemanticError } from "../../SemanticError";
import { joinPath, splitPath } from "../../common/pathFunctions";

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
export function resolveReferences(root: Assembly): Assembly {
    const scopes = createScopes(root);
    let declarations = root.declarations.map(declaration => {
        return traverse(declaration, {
            leave(node) {
                if (node instanceof Reference) {
                    const scope = scopes.get(node.scopeKey);
                    const declarations = scope[node.name];
                    if (!declarations) {
                        const possiblePaths = getPossiblePaths(declaration.absolutePath, node.name);
                        for (const path of possiblePaths) {
                            const external = scope[path];
                            if (external) {
                                // change this reference to the new path
                                return node.patch({ name: path });
                            }
                        }
                        throw new SemanticError(`Could not resolve reference: ${node.name}`, node);
                    }
                }
            }
        });
    })
    return new Assembly(declarations);
}