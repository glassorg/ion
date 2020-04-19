
export type Class = any & {
    id: string
    implements: string[]
}

export function isInstance(_class: Class, instance) {
    if (instance != null) {
        let _implements = instance.constructor as Set<string> | undefined
        if (_implements) {
            return _implements.has(_class.id)
        }
    }
    return false
}
