
export const String = {
    name: "ion_String",
    is(value): value is string {
        return typeof value === "string";
    }
};
