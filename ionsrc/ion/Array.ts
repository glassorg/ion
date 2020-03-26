
export const Array = {
    name: "ion_Array",
    is(value): value is any[] {
        return global.Array.isArray(value);
    }
}
