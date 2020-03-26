import Assembly from "../ast/Assembly";
import { traverse, skip, remove } from "../Traversal";
import { BinaryExpression, ExternalReference, ConstrainedType, VariableDeclaration, Module, TypeDeclaration, ClassDeclaration, FunctionExpression, Parameter, BlockStatement, Declaration, ReturnStatement, FunctionType, MemberExpression, Node } from "../ast";

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
    let suffix = ""
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

//  Is my conversion to Typescript technique sound?
//  Pre-converting nodes is a bit problematic...
//  Perhaps I should convert top down instead of bottom up?
//  Types are gone otherwise, so I believe we HAVE to go from top down.
//  TODO: convert to top-down conversion to Javascript.

const toAstEnter = {

}

const toAstLeave = {
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
    ConstrainedType(node: ConstrainedType) {
        return node.baseType
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
    ReturnStatement(node: ReturnStatement) {
        return {
            type: "ReturnStatement",
            argument: node.value
        }
    },
    MemberExpression(node: MemberExpression) {
        return {
            type: "MemberExpression",
            object: node.left,
            property: node.right,
        }
    },
    ClassDeclaration(node: ClassDeclaration) {
        return {
            type: "ClassDeclaration",
            id: node.id,
            body: {
                type: "ClassBody",
                body: node.declarations.map(d => {
                    return { ...d, kind: "property" }
                })
                // .map((d: any) => {
                //     return {
                //         type: "Property",
                //         //  hmmm, the declarations HAVE been already converted as variable declarations.
                //         //  that is sub-optimal.
                //         key: { type: "Identifier", name: d.declarations[0].id.name },
                //         // value: {
                //         //     type: "BinaryExpression",
                //         //     left: { type: "Identifier", name: "number" },
                //         //     operator: "|",
                //         //     right: { type: "Identifier", name: "string" },
                //         // }
                //         value: { type: "Literal", value: "Bar", verbatim: "Type goes here." },
                //     }
                // })
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
    FunctionType(node: FunctionType) {
        return {
            type: "Literal",
            value: 1971
        }
    },
    ExternalReference(node: ExternalReference) {
        //  don't modify ExternalReferences on leave,
        //  they will be handled by VariableDeclaration
        return node
    },
    TypeDeclaration(node: VariableDeclaration, ancestors: Node[], path: string[]) {
        return { ...toAstLeave.VariableDeclaration(node, ancestors, path), kind: "type" }
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
                tstype: node.type,
                init: node.value
            }]
        };
    },
}

function toJavascriptAst(node: Node) {
    return traverse(node, {
        enter(node, ancestors, path) {
            // if (ClassDeclaration.is(node)) {
            //     console.log("Class enter, change declarations to properties");
            // }
        },
        leave(node, ancestors, path) {
            let newNode = (toAstLeave[node.constructor.name] || toAstLeave.default)(node, ancestors, path)
            if (Declaration.is(node) && node.export) {
                newNode = {
                    type: "ExportNamedDeclaration",
                    declaration: newNode,
                }
            }
            return newNode
        }
    })
}

export default function(root: Assembly) {
    return toJavascriptAst(root)
}
