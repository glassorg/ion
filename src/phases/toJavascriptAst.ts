import Assembly from "../ast/Assembly";
import { traverse, skip, remove } from "../Traversal";
import { BinaryExpression, ExternalReference, ConstrainedType, VariableDeclaration, Module, TypeDeclaration, ClassDeclaration, FunctionExpression, Parameter, BlockStatement, Declaration } from "../ast";

const typeMap = {
    Id: "Identifier",
    Reference: "Identifier",
    TypeReference: "Identifier",
    ExternalReference: "Identifier",
}

const operatorMap = {
    "==": "===",
    "!=": "!=="
}

function toRelativeModulePath(from: string, to: string) {
    let a = from.split('.')
    let b = to.split('.')
    while (a[0] === b[0]) {
        a.shift()
        b.shift()
    }
    let prefix = "./"
    let suffix = ".js"
    if (a.length == 2) {
        prefix = "../"
    }
    else if (a.length > 2) {
        prefix = "../"
        for (let i = 2; i < a.length; i++) {
            prefix = "../" + prefix
        }
    }

    return prefix + b.join("/") + suffix
}

const toAst = {
    default(node) {
        let name = node.constructor.name
        let type = typeMap[name] || name
        let esnode = { type, ...node } as any
        if (BinaryExpression.is(node)) {
            esnode.operator = operatorMap[node.operator] || node.operator
        }
        return esnode
    },
    Module(node: Module) {
        return node
    },
    BlockStatement(node: BlockStatement) {
        return {
            type: "BlockStatement",
            body: node.statements,
        }
    },
    Parameter(node: Parameter) {
        if (node.value) {
            return {
                type: "AssignmentPattern",
                left: node.id,
                right: node.value,
            }
        }
        else {
            return node.id
        }
    },
    ClassDeclaration(node: ClassDeclaration) {
        return {
            type: "ClassDeclaration",
            id: node.id,
            body: {
                type: "ClassBody",
                body: node.declarations
            }
        }
    },
    FunctionExpression(node: FunctionExpression) {
        return {
            type: "FunctionExpression",
            id: node.id,
            params: node.parameters,
            body: node.body,
        }
    },
    ExternalReference(node: ExternalReference) {
        // don't modify ExternalReferences on leave,
        //  they will be handled by VariableDeclaration
        return node
    },
    VariableDeclaration(node: VariableDeclaration, ancestors: Node[], path: string[]) {
        // check if value is ExternalReference
        if (ExternalReference.is(node.value)) {
            let thisModuleName =  path[1]
            let ref = node.value as ExternalReference
            return {
                type: "ImportDeclaration",
                specifiers: [
                    {
                        type: "ImportSpecifier",
                        imported: {
                            type: "Identifier",
                            name: ref.name,
                        },
                        local: node.id,
                    }
                ],
                source: {
                    type: "Literal",
                    value: toRelativeModulePath(thisModuleName, ref.file),
                }
            }
        };
        return {
            type: "VariableDeclaration",
            kind: node.assignable ? "let" : "const",
            declarations: [{
                type: "VariableDeclarator",
                id: node.id,
                init: node.value
            }]
        };
    },
}

export default function toJavascriptAst(root: Assembly) {
    traverse(root, {
        leave(node, ancestors, path) {
            let newNode = (toAst[node.constructor.name] || toAst.default)(node, ancestors, path)
            if (Declaration.is(node) && node.export) {
                newNode = {
                    type: "ExportNamedDeclaration",
                    declaration: newNode,
                }
            }
            return newNode
        }
    })
    return root
}
