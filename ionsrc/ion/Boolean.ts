
export const Boolean = {
    name: "ion_Boolean",
}
export function isBoolean(value): value is boolean {
    return typeof value === "boolean";
}
