
export type Array = any[]

export function isArray(value): value is any[] {
    return Array.isArray(value);
}
