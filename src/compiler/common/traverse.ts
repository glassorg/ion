import { traverse as glasTraverse, Visitor } from "@glas/traverse";
import { AstNode } from "../ast/AstNode";
export { Lookup, remove, replace, skip, Replace, Visitor } from "@glas/traverse";

export function traverse(root: any, visitor: Visitor) {
    return glasTraverse(root, {
        skip(node: any) {
            return !(node instanceof AstNode);
        },
        ...visitor
    });
}