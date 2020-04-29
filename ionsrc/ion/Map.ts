
export type Map<K,V> = globalThis.Map<K,V>

export function isMap<K,V>(value): value is Map<K,V> {
    return value instanceof globalThis.Map
}
