import * as ast from "./ast";
import { Node } from "./ast";
import { memoize } from "./common";


const codeToString: { [P in keyof typeof ast]?: (node: InstanceType<typeof ast[P]>) => string} = {
    Id(node) {
        return node.name
    },
    TypeExpression(node) {
        return s(node.value)
    },
    DotExpression(node) {
        return "."
    },
    Reference(node) {
        return node.name
    },
    Argument(node) {
        if (node.name != null) {
            return `${node.name}:${s(node.value)}`
        }
        return `${s(node.value)}`
    },
    Parameter(node) {
        let value = s(node.id)
        if (node.type) {
            value += `: ${s(node.type)}`
        }
        if (node.value) {
            value += ` = ${s(node.value)}`
        }
        return `${value}`
    },
    Literal(node) {
        return JSON.stringify(node.value)
    },
    BinaryExpression(node) {
        return `(${s(node.left)} ${node.operator} ${s(node.right)})`
    },
    UnaryExpression(node) {
        return `${node.operator}${s(node.argument)}`
    },
    MemberExpression(node) {
        if (ast.Id.is(node.property)) {
            return `${s(node.object)}.${s(node.property)}`
        }
        else {
            return `${s(node.object)}[${s(node.property)}]`
        }
    },
    CallExpression(node) {
        return `${s(node.callee)}(${node.arguments.map(s).join(', ')})`
    },
    VariableDeclaration(node) {
        return (node.assignable ? 'var ' : 'let ') + codeToString.Parameter!(node)
    },
    IfStatement(node) {
        let result =`(if ${s(node.test)} then ${s(node.consequent)}`
        if (node.alternate) {
            result += ` else ${s(node.alternate)} end`
        }
        else {
            result += ` end)`
        }
        return result
    },
    BlockStatement(node) {
        return `{ ${node.statements.map(s).join('; ')} }`
    }
}


const s = memoize(
    function (node: Node) {
        let fn = codeToString[node.constructor.name]
        if (fn == null) {
            debugger
            throw new Error(`codeToString function not found for type: ${node.constructor.name}`)
        }
        return fn(node)
    }
)

export default function toCodeString(node: Node) {
    return s(node)
}