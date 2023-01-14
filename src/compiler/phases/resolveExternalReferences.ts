import { AnalyzedDeclaration, ResolvedDeclaration } from "../ast/Declaration";
import { Reference } from "../ast/Reference";
import { traverse } from "../common/traverse";
import { createScopes } from "../createScopes";
import { SemanticError } from "../SemanticError";
import { getPossiblePaths } from "./getPossibleExternalReferences";

export function resolveExternalReferences(root: AnalyzedDeclaration, externals: ResolvedDeclaration[]): AnalyzedDeclaration {
    const scopes = createScopes(root, externals);
    const found = new Set<string>();
    root = traverse(root, {
        leave(node) {
            if (node instanceof Reference) {
                if (node.name === root.id.name) {
                    // self reference.
                    // throw new SemanticError(`Only recursive functions can self reference, but not yet`, node);
                }
                const scope = scopes.get(node);
                const declarations = scope[node.name];
                if (!declarations) {
                    const possiblePaths = getPossiblePaths(root.absolutePath, node.name);
                    for (const path of possiblePaths) {
                        const external = scope[path];
                        if (external) {
                            found.add(path);
                            // change this reference to the new path
                            return node.patch({ name: path });
                        }
                    }
                    throw new SemanticError(`Could not resolve reference: ${node.name}`, node);
                }
            }
        }
    })
    root = root.patch({ externals: root.externals.filter(e => found.has(e))});
    return root;
}