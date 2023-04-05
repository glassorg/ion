export const CoreTypes = {
    Integer: "Integer",
    Float: "Float",
    Boolean: "Boolean",
    Array: "Array",
    NaN: "NaN",
    Native: "@Native",
    String: "String",
    Any: "Any",
    Never: "Never",
    Type: "Type",
    Function: "Function",
} as const;

export const CoreProperty = {
    Length: "length"
}

export type CoreType = keyof typeof CoreTypes;

export function isCoreType(name: string): name is CoreType {
    return CoreTypes[name as CoreType] != null;
}
