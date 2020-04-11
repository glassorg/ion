import { Location } from "./ast"

class Replace {
    readonly items: readonly any[]
    constructor(items: readonly any[]) {
        this.items = items
    }
}

class Pair {
    key
    value
    constructor(key, value) {
        this.key = key
        this.value = value
    }
}

export const skip = Symbol('skip')
export function replace(...items: readonly any[]) {
    return new Replace(items)
}
export function pair(key, value) {
    return new Pair(key, value)
}
export const remove = Object.freeze(new Replace(Object.freeze([])))
export type enter = (node: any, ancestors: object[], path: string[]) => Symbol | void
export type leave = (node: any, ancestors: object[], path: string[]) => object | object[] | void
export type predicate = (node: any) => boolean
export type Visitor = { enter?: enter, leave?: leave, skip?: predicate, filter?: predicate }

interface ContainerHelper<C = any, K = any, V = any> {
    type: string,
    create(original: C): C
    keys(container: C): IterableIterator<K>
    getValue(container: C, key: K): V
    setValue(container: C, key: K, value: V | Replace)
    normalize(container: C): C
}

// key value pairs in the Replace ??? or something else?
//  Array => value
//  Object => Pair(key, value)
//  Map => Pair(key, value)
//  Set => value

const objectContainerHelper: ContainerHelper<any, string, any> = {
    type: "Object",
    create(original) {
        // create a new empty object of the same type
        if (original.constructor === Object) {
            return {}
        }
        else {
            // for typed objects, recycle self
            return original
        }
    },
    *keys(container) {
        for (let key in container) {
            if (!key.startsWith("_")) {
                yield key
            }
        }
    },
    getValue(container, key: string) {
        return container[key]
    },
    setValue(container, key: string, value) {
        if (value instanceof Pair) {
            // a Pair overrides the initial value
            container[value.key] = value.value
        }
        else {
            container[key] = value
        }
    },
    normalize(container) {
        let newContainer = this.create(container)
        for (let key of this.keys(container)) {
            let value = this.getValue(container, key)
            if (value instanceof Replace) {
                for (let item of value.items) {
                    this.setValue(newContainer, key, item)
                }
            }
            else {
                this.setValue(newContainer, key, value)
            }
        }
        return newContainer
    }
}

const arrayContainerHelper: ContainerHelper<any[], number, any> = {
    ...objectContainerHelper,
    type: "Array",
    create(original: any[]) {
        return []
    },
    keys(container: any[]) {
        return container.keys()
    },
    getValue(container: any[], key: number) {
        return container[key]
    },
    setValue(container: any[], key: number, value) {
        if (value instanceof Pair) {
            throw new Error("Cannot use a Pair on an Array container")
        }
        container[key] = value
    },
    normalize(container) {
        let newContainer = this.create(container)
        for (let value of container) {
            if (value instanceof Replace) {
                for (let item of value.items) {
                    newContainer.push(item)
                }
            }
            else {
                newContainer.push(value)
            }
        }
        return newContainer
    }
}

const mapContainerHelper: ContainerHelper<Map<any,any>, any, any> = {
    ...objectContainerHelper,
    type: "Map",
    create() {
        return new Map<any,any>()
    },
    keys(container: Map<any,any>) {
        return container.keys()
    },
    getValue(container: Map<any,any>, key) {
        return container.get(key)
    },
    setValue(container: Map<any,any>, key, value) {
        if (value instanceof Pair) {
            // a Pair overrides the initial value
            container.set(value.key, value.value)
        }
        else {
            container.set(key, value)
        }
    }
}

function getContainerHelper(node): ContainerHelper | null {
    if (node != null) {
        if (Array.isArray(node)) {
            return arrayContainerHelper
        }
        if (node instanceof Map) {
            return mapContainerHelper
        }
        if (typeof node === "object") {
            return objectContainerHelper
        }
    }
    return null
}

export function getValue(container, key) {
    return getContainerHelper(container)!.getValue(container, key)
}

export function setValue(container, key, value) {
    getContainerHelper(container)!.setValue(container, key, value)
}

export function defaultSkip(node) {
    return node.constructor === Object || node instanceof Set || node instanceof Location
}

export function defaultFilter(node) {
    return node != null && typeof node === "object" && !Array.isArray(node) && !(node instanceof Map) && node.constructor !== Object
}

// How do we know to skip some objects like raw objects? without knowing about Node.is?
export function traverseChildren(
    container: any,
    visitor: Visitor,
    ancestors: object[] = [],
    path: any[] = []
) {
    const helper = getContainerHelper(container)
    if (helper != null) {
        let hasReplaces = false

        ancestors.push(container)
        for (let key of helper.keys(container)) {
            path.push(key)
            let child = helper.getValue(container, key)
            let result = traverse(child, visitor, ancestors, path)
            if (result !== undefined) {
                if (result instanceof Replace) {
                    hasReplaces = true
                }
                helper.setValue(container, key, result)
            }
            path.pop()
        }
        ancestors.pop()

        if (hasReplaces) {
            container = helper.normalize(container)
        }
    }

    return container
}

export function traverse(
    node:any,
    visitor: Visitor,
    ancestors: object[] = [],
    path: string[] = []
): any {
    const {enter, leave, skip: _skip = defaultSkip, filter = defaultFilter} = visitor
    if (node == null || _skip(node)) {
        return node
    }

    const callback = filter(node)

    let enterResult: any = null
    if (callback && enter != null) {
        enterResult = enter(node, ancestors, path)
    }
    if (enterResult !== skip) {
        node = traverseChildren(node, visitor, ancestors, path)
    }
    let leaveResult: any = null
    if (callback && leave != null) {
        leaveResult = <any>leave(node, ancestors, path)
    }
    return leaveResult || node
}
