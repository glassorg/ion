
const validIdRegex = /^[@a-z_][@a-z0-9_]*$/i
export function isValidId(name: string) {
    return validIdRegex.test(name)
}

export function isMetaId(name: string) {
    return isValidId(name) && name[0] === "@";
}