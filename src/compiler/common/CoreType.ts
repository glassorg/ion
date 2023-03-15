export const CoreTypes = {
    Integer: "Integer",
    Boolean: "Boolean",
    Array: "Array",
    Float: "Float",
    NaN: "NaN",
    String: "String",
    Any: "Any",
    Native: "@Native",
    Always: "Always",
    Never: "Never",
} as const;

export type CoreType = keyof typeof CoreTypes;

export function isCoreType(name: string): name is CoreType {
    return CoreTypes[name as CoreType] != null;
}
