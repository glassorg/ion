import { traverse, skip } from "../Traversal";
import { ScopeMaps } from "../createScopeMaps";
import toposort from "../toposort";
import { Typed, FunctionExpression, ReturnStatement, CallExpression, Expression } from "../ast";
import * as ast from "../ast";


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

// that is some typescript kung fu right there.
export const getPredecessors: { [P in keyof typeof ast]?: (e: InstanceType<typeof ast[P]>, scope: ScopeMaps) => Iterator<Typed>} = {
    *BinaryExpression(node) {
        yield node.left
        yield node.right
    },
    *Literal(node) {
    },
    *ClassDeclaration(node) {
        yield* node.baseClasses
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
    *FunctionExpression(node) {
        yield* node.parameters
        for (let returnStatement of getReturnStatements(node)) {
            yield returnStatement.value   
        }
    },
    *Reference(node, scopes) {
        yield scopes.get(node)[node.name]
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
    *UnaryExpression(node) {
        yield node.argument
    }
}

export default function getSortedTypedNodes(root, scopeMap: ScopeMaps) {
    let sentinel = {};
    let edges: any[] = [];
    traverse(root, {
        leave(node) {
            if (Typed.is(node)) {
                let func = getPredecessors[node.constructor.name];
                let count = 0;
                if (func) {
                    for (let pred of func(node, scopeMap)) {
                        count++;
                        edges.push([pred, node]);
                    }
                }
                if (count === 0) {
                    edges.push([sentinel, node]);
                }
            }
        }
    });
    let sorted = toposort(edges);
    //  remove sentinel
    sorted.shift();
    return sorted;
}
