import * as ast from "./ast";
import { Node } from "./ast";
import { memoize } from "./common";


const codeToString: { [P in keyof typeof ast]?: (node: InstanceType<typeof ast[P]>) => string} = {
    Id(node) {
        return node.name
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
    }
}


const s = memoize(
    function (node: Node) {
        return codeToString[node.constructor.name](node)
    }
)

export default function toCodeString(node: Node) {
    return s(node)
}