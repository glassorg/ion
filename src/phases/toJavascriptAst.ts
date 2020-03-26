import Assembly from "../ast/Assembly";
import { traverse, skip, remove } from "../Traversal";
import { BinaryExpression, ExternalReference, ConstrainedType, VariableDeclaration, Module, TypeDeclaration, ClassDeclaration, FunctionExpression, Parameter, BlockStatement, Declaration, ReturnStatement, FunctionType, MemberExpression, Node, UnionType } from "../ast";

const typeMap = {
    Id: "Identifier",
    Reference: "Identifier",
    TypeReference: "Identifier",
    ExternalReference: "Identifier",
}

const operatorMap = {
    "==": "===",
    "!=": "!==",
    "and": "&&",
    "or": "||",
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
            esnode.type = "BinaryExpression"
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
            }
        }
    },
    FunctionExpression(node: FunctionExpression) {
        return {
            type: "FunctionExpression",
            id: node.id,
            params: node.parameters,
            tstype: node.returnType,
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
            let specifiers = [
                {
                    type: "ImportSpecifier",
                    imported: {
                        type: "Identifier",
                        name: ref.name,
                    },
                    local: node.id as any,
                }
            ]
            let isType = ref.name[0] === ref.name[0].toUpperCase()
            if (isType) {
                // then we must also import the is
                specifiers.push({
                    type: "ImportSpecifier",
                    imported: {
                        type: "Identifier",
                        name: `is${ref.name}`,
                    },
                    local: {
                        type: "Identifier",
                        name: `is${ref.name}`,
                    },
                })
            }
            return {
                type: "ImportDeclaration",
                specifiers,
                source: {
                    type: "Literal",
                    value: toRelativeModulePath(thisModuleName, ref.file),
                }
            }
        };

        let value = node.value as any
        if (value && value.type === "FunctionExpression" && node.id.name === value.id.name) {
            // simplify
            //  const foo = function foo() {}
            // into
            //  function foo() {}
            return { ...value, type: "FunctionDeclaration" }
        }

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
