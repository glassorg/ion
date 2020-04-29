
export type Array<T> = globalThis.Array<T>

export function isArray<T>(value): value is Array<T> {
    return Array.isArray(value);
}
