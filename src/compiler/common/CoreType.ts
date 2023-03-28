export const CoreTypes = {
    Integer: "Integer",
    Float: "Float",
    Boolean: "Boolean",
    Any: "Any",
    Array: "Array",
    NaN: "NaN",
    Native: "@Native",
    String: "String",
    Always: "Always",
    Never: "Never",
    Type: "Type",
} as const;

export const CoreProperty = {
    Length: "length"
}

export type CoreType = keyof typeof CoreTypes;

export function isCoreType(name: string): name is CoreType {
    return CoreTypes[name as CoreType] != null;
}
