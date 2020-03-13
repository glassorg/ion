import createScopeMap from "../createScopeMap";
import Assembly from "../ast/Assembly";
import { traverse, skip } from "../Traversal";
import { Module, Node, Reference, Id, ImportStep, VariableDeclaration, ExternalReference, ConstrainedType, IntersectionType, UnionType, Literal, BinaryExpression, ThisExpression, TypeDeclaration, Declaration } from "../ast";
import TypeExpression from "../ast/TypeExpression";
import { normalize } from "path";

export function normalizeTypeExpression(type: TypeExpression) {
    return type
}

const operatorToName = {
    "==": "equals",
    "!=": "not_equals",
    "!": "not",
    ">": "greater_than",
    "<": "less_than",
    ">=": "greater_than_or_equal",
    "<=": "less_than_or_equal",
    "|": "or",
    "&": "and",
    ".": "dot",
}

export function generateName(type: TypeExpression): string
export function generateName(type: TypeExpression, buffer: string[]): void
export function generateName(type: TypeExpression, buffer?: string[]) {
    let root = buffer == null
    const b = buffer != null ? buffer : buffer = []
    traverse(type, {
        enter(node) {
            if (BinaryExpression.is(node)) {
                let e = node as UnionType
                generateName(e.left, b)
                b.push(operatorToName[e.operator] ?? e.operator)
                generateName(e.right, b)
                return skip
            }
            if (Literal.is(node)) {
                b.push(node.value.toString().replace(/[^a-z0-9_]/i, (match: string) => `$${match.charCodeAt(0)}$`))
                return skip
            }
            if (ThisExpression.is(node)) {
                b.push("this")
                return skip
            }
            if (node.name) {
                b.push(node.name)
            }
        }
    })
    if (root) {
        return b.join("_")
    }
}

// normalize type expressions so
export default function typeNormalization(root: Assembly) {
    for (let module of Object.values(root.modules)) {
        let declarations = new Set<string>()
        traverse(module, {
            enter(node) {
                if (Declaration.is(node)) {
                    let declaration = node as Declaration
                    declarations.add(declaration.id.name)
                }
            },
            leave(node) {
                if (VariableDeclaration.is(node)) {
                    let newDeclarations: TypeDeclaration[] = []
                    traverse(node, {
                        enter(node) {
                            if (TypeExpression.is(node)) {
                                return skip
                            }
                        },
                        leave(node) {
                            if (TypeExpression.is(node)) {
                                let normalized = normalizeTypeExpression(node)
                                let name = generateName(normalized)
                                if (!declarations.has(name)) {
                                    declarations.add(name)
                                    // add new variable to newDeclarations
                                    newDeclarations.push(new TypeDeclaration({
                                        id: new Id({ name }),
                                        value: node
                                    }))
                                }
                                return new Reference({ name })
                            }
                        }
                    })
                    return [...newDeclarations, node]
                }
            }
        })
    }
    return root
}
