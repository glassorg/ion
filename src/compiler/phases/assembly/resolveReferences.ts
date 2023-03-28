import { Assembly } from "../../ast/Assembly";
import { Reference } from "../../ast/Reference";
import { traverse } from "../../common/traverse";
import { createScopes } from "../../createScopes";
import { SemanticError } from "../../SemanticError";
import { joinPath, splitPath } from "../../common/pathFunctions";
import { ConstrainedType } from "../../ast/ConstrainedType";
import { isTypeName } from "../../common/names";
import { MultiFunction } from "../../ast/MultiFunction";
import { VariableDeclaration } from "../../ast/VariableDeclaration";
import { DeferredReference } from "../../ast/DeferredReference";

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
    let rootDeclarations = root.declarations.map(rootDeclaration => {
        return traverse(rootDeclaration, {
            leave(node, ancestors) {
                if (node instanceof Reference) {
                    const scope = scopes.get(node.scopeKey);
                    const declaration = scope[node.name];
                    const couldBeTypeExpressionMemberReference = !isTypeName(node.name) && ancestors.find(a => a instanceof ConstrainedType);
                    const isMultiFunction = declaration instanceof VariableDeclaration && declaration.value instanceof MultiFunction;
                    const shouldDefer = couldBeTypeExpressionMemberReference && (!declaration || isMultiFunction);
                    if (shouldDefer) {
                        return new DeferredReference(node);
                    }
                    if (!declaration) {
                        const possiblePaths = getPossiblePaths(rootDeclaration.absolutePath, node.name);
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
    return new Assembly(rootDeclarations);
}