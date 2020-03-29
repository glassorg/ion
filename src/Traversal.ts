import { Node } from "./ast";

export function flatten(array: any[]) {
    let flat = array.reduce(
        (a:any,b:any) => {
            if (Array.isArray(b)) {
                a.splice(a.length, 0, ...b)
            }
            else {
                a.push(b)
            }
            return a
        },
        []
    )
    // now insert values in place into array
    array.splice(0, array.length, ...flat)
}

export const remove = Object.freeze([])
export const skip = Symbol('skip')

export type enter = (node: any, ancestors: object[], path: string[]) => Symbol | void
export type leave = (node: any, ancestors: object[], path: string[]) => object | object[] | void

export type Visitor = { enter?: enter, leave?: leave }

function traverseChildren(container: any, visitor: Visitor, ancestors: object[], path: string[]) {
    ancestors.push(container)

    const isArray = Array.isArray(container)
    const isContainerMap = container instanceof Map
    let hasArrays = false
    function traverseChild(name: string, child: any) {
        path.push(name)
        let childResult = traverse(child, visitor, ancestors, path)
        // it doesn't look like remove works right now on Maps or maybe anything?
        if (childResult === remove) {
            if (isContainerMap) {
                container.delete(name)
            }
            else {
                delete container[name]
            }
        }
        else if (childResult !== child && childResult !== undefined) {
            let isChildArray = Array.isArray(childResult)
            if (isChildArray) {
                if (!isArray) {
                    if (childResult.length > 0)
                        throw new Error("Cannot return array with length > 0 unless container is array")
                    else
                        childResult = undefined
                }
                else {
                    hasArrays = true
                }
            }
            if (isContainerMap) {
                container.set(name, childResult)
            }
            else {
                container[name] = childResult
            }
        }
        path.pop()
    }
    if (isContainerMap) {
        for (let key of container.keys()) {
            let child = container.get(key)
            traverseChild(key, child)
        }
    }
    else {
        for (let name in container) {
            let child = container[name]
            traverseChild(name, child);
        }
    }
    ancestors.pop()
    //  now flatten current array if needed
    if (hasArrays) {
        container = flatten(container)
    }
}

export function traverse(
    node:any,
    visitor: Visitor,
    ancestors: object[] = [],
    path: string[] = []
): any {
    if (node == null)
        return node

    const {enter, leave} = visitor
    const isObject = typeof node === 'object' // && node != null // implied
    const isNode = Node.is(node)
    const isArray = Array.isArray(node)
    const isMap = node.constructor === Map
    let enterResult: any = null
    if (isNode && enter != null) {
        enterResult = enter(node, ancestors, path)
    }
    if (enterResult !== skip && (isNode || isArray || isObject || isMap)) {
        traverseChildren(node, visitor, ancestors, path)
    }
    //  then call leave on node unless it's an array.
    let result = undefined
    if (isNode && leave != null)
        result = <any>leave(node, ancestors, path)
    return result != null ? result : node
}