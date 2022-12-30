import { Lookup, traverse as glasTraverse, Visitor } from "@glas/traverse";
import { AstNode } from "../ast/AstNode";
import { AnalyzedDeclaration } from "../ast/Declaration";
import { createScopes } from "../createScopes";
import { EvaluationContext } from "../EvaluationContext";
export { Lookup, remove, replace, skip, Replace, Visitor } from "@glas/traverse";

export function traverse(root: any, visitor: Visitor) {
    return glasTraverse(root, {
        skip(node: any) {
            return !(node instanceof AstNode || Array.isArray(node));
        },
        ...visitor
    });
}

export function traverseWithContext(root: any, externals: AnalyzedDeclaration[], visitor: (c: EvaluationContext) => Visitor) {
    const lookup = new Lookup();
    const scopes = createScopes(root, externals);
    const context = new EvaluationContext(lookup, scopes);
    return traverse(root, { ...visitor(context), lookup });
}
