
export type Set = any

export function isSet(value): value is Set {
    return value instanceof global.Set;
}
