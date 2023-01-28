
export const CoreTypes = {
    Boolean: "Integer", //  for now
    Integer: "Integer",
    Float: "Float",
    NaN: "NaN",
    String: "String",
} as const;

export type CoreType = keyof typeof CoreTypes;

export function isCoreType(name: string): name is CoreType {
    return CoreTypes[name as CoreType] != null;
}
