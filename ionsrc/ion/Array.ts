
export const Array = {
    name: "ion_Array",
}

export function isArray(value): value is any[] {
    return global.Array.isArray(value);
}
