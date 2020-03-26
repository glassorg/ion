
export const Boolean = {
    name: "ion_Boolean",
    is(value): value is boolean {
        return typeof value === "boolean";
    }
}
