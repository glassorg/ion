
export type Set<V> = globalThis.Set<V>

export function isSet<V>(value): value is Set<V> {
    return value instanceof globalThis.Set;
}
