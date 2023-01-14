import { Lookup, traverse as glasTraverse, Visitor } from "@glas/traverse";
import { Assembly } from "../ast/Assembly";
import { AstNode } from "../ast/AstNode";
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

export function traverseWithContext(assembly: Assembly, visitor: (c: EvaluationContext) => Visitor) {
    const lookup = new Lookup();
    const scopes = createScopes(assembly);
    const context = new EvaluationContext(lookup, scopes);
    return traverse(assembly, { ...visitor(context), lookup });
}
