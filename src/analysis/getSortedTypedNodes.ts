import { traverse, skip } from "../Traversal";
import { ScopeMaps } from "../createScopeMaps";
import toposort from "../toposort";
import { Typed, FunctionExpression, ReturnStatement, CallExpression, BinaryExpression, Expression } from "../ast";
import * as ast from "../ast";
import { getLast, SemanticError } from "../common";
import toCodeString from "../toCodeString";


function getReturnStatements(node: FunctionExpression): ReturnStatement[] {
    let statements: ReturnStatement[] = []
    traverse(node, {
        enter(node) {
            if (CallExpression.is(node)) {
                return skip
            }
        },
        leave(node) {
            if (ReturnStatement.is(node)) {
                statements.push(node)
            }
        }
    })
    return statements
}

export function getAncestorDeclaration(node, scopeMap: ScopeMaps, ancestorMap: Map<ast.Node, Array<any>>, type: (node) => boolean) {
    let ancestors = ancestorMap.get(node)!
    let containingIf = getLast(ancestors, ast.IfStatement.is)!
    let containingIfScope = scopeMap.get(containingIf)
    let containingVarDeclaration = containingIfScope[node.id.name]
    return containingVarDeclaration
}

// that is some typescript kung fu right there.
export const getPredecessors: { [P in keyof typeof ast]?: (e: InstanceType<typeof ast[P]>, scopeMap: ScopeMaps, ancestorMap: Map<ast.Node, Array<any>>) => Iterator<Typed>} = {
    *ConditionalDeclaration(node, scopeMap, ancestorMap) {
        // the conditional declaration will add it's own local conditional assertion to the variable type
        // from the containing scope, so we are dependent on that variable being resolved first.
        yield getAncestorDeclaration(node, scopeMap, ancestorMap, ast.IfStatement.is)
    },
    *BinaryExpression(node) {
        yield node.left
        yield node.right
    },
    *UnaryExpression(node) {
        yield node.argument
    },
    *Literal(node) {
    },
    *ObjectExpression(node) {
        for (let property of node.properties) {
            if (Typed.is(property.key)) {
                yield property.key
            }
            yield property.value
        }
    },
    *ClassDeclaration(node) {
        yield* node.baseClasses
        yield* node.declarations.values()
    },
    *Parameter(node) {
        if (node.type) {
            yield node.type
        }
        if (node.value) {
            yield node.value
        }
    },
    *VariableDeclaration(node) {
        if (node.value) {
            yield node.value
        }
        if (node.type) {
            yield node.type
        }
    },
    *TypeDeclaration(node) {
    },
    *FunctionExpression(node) {
        yield* node.parameters
        for (let returnStatement of getReturnStatements(node)) {
            yield returnStatement.value   
        }
    },
    *Reference(node, scopes) {
        let referencedNode = scopes.get(node)[node.name]
        if (referencedNode == null) {
            throw SemanticError("Referenced value not found", node)
        }
        yield referencedNode
    },
    *TemplateReference(node) {
        yield node.reference
        yield* node.arguments
    },
    *MemberExpression(node) {
        yield node.object
        if (Expression.is(node.property)) {
            yield node.property
        }
    },
    *ArrayExpression(node) {
        yield* node.elements
    },
    *CallExpression(node) {
        yield node.callee
        for (let arg of node.arguments) {
            yield arg.value
        }
    },
}

export default function getSortedTypedNodes(root, scopeMap: ScopeMaps, ancestorsMap: Map<ast.Node, Array<any>>) {
    let sentinel = {};
    let edges: any[] = [];
    function push(from, to) {
        if (from == null || to == null) {
            throw new Error("Edge nodes not be null")
        }
        if (from === to) {
            console.error(from)
            throw new Error("Attempt to add same node as dependency of itself")
        }
        edges.push([from, to])
    }
    traverse(root, {
        leave(node) {
            if (Typed.is(node)) {
                if (BinaryExpression.is(node)) {
                    push(node.left, node.right)
                }
                let func = getPredecessors[node.constructor.name];
                let count = 0;
                if (func) {
                    for (let pred of func(node, scopeMap, ancestorsMap)) {
                        count++;
                        push(pred, node);
                    }
                }
                if (count === 0) {
                    push(sentinel, node);
                }
            }
        }
    });
    let sorted = toposort(edges);
    //  remove sentinel
    sorted.shift();
    return sorted;
}
