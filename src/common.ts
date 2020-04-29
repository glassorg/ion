import * as fs from "fs";
import * as np from "path";
import Assembly from "./ast/Assembly";

////////////////////////////////////////////////////////////////////////////////
//  Import/Export Functions
////////////////////////////////////////////////////////////////////////////////

export const PATH_SEPARATOR = "."
export const EXPORT_DELIMITER = ":"

// export function isTypeReference(node): node is Reference {
//     if (!Reference.is(node)) {
//         return false
//     }
//     let first = getLastName(node.name)[0]
//     return first === first.toUpperCase()
// }

export function getLastName(absoluteName: string) {
    return absoluteName.slice(absoluteName.lastIndexOf(PATH_SEPARATOR) + 1)
}

export function getTypeCheckFunctionName(name: string) {
    // this could be an external file.path:Name
    let names = getExternalModuleNameAndExportName(name)!
    if (names) {
        let [ moduleName, exportName ] = names
        return getAbsoluteName(moduleName, "is" + exportName)
    }
    else {
        return "is" + name
    }
}

export function getUniqueClientName(absoluteName: string) {
    let [ moduleName, declarationName ] = getExternalModuleNameAndExportName(absoluteName)!
    let lastName = getLastName(moduleName)
    return moduleName.replace(".", "_") + (lastName === declarationName ? "" : "_" + declarationName)
}

export function getAbsoluteName(moduleName: string, declarationName: string) {
    let lastName = getLastName(moduleName)
    return moduleName + EXPORT_DELIMITER + declarationName
}

export function getExternalModuleNameAndExportName(absoluteName: string): [string, string] | null {
    let colon = absoluteName.lastIndexOf(EXPORT_DELIMITER)
    if (colon < 0) {
        // this is not an external reference, so return null
        return null
    }
    return [ absoluteName.slice(0, colon), absoluteName.slice(colon + 1)]
}

export function getLocalName(absoluteName: string, localModuleName: string) {
    let names = getExternalModuleNameAndExportName(absoluteName)
    if (names) {
        let [ moduleName, exportName ] = names
        if (moduleName === localModuleName) {
            return exportName
        }
    }
    return null
}

export function getAllExports(root: Assembly) {
    let names = new Set<string>()
    for (let moduleName of root.modules.keys()) {
        let module = root.modules.get(moduleName)!
        for (let declaration of module.declarations) {
            let declarationName = declaration.id.name
            names.add(getAbsoluteName(moduleName, declarationName))
        }
    }
    return names
}

////////////////////////////////////////////////////////////////////////////////
//  Miscelaneous Functions
////////////////////////////////////////////////////////////////////////////////

export function clone(value) {
    if (value == null || typeof value !== "object") {
        return value
    }
    if (value.clone) {
        return value.clone()
    }
    if (value instanceof Set) {
        return new Set(Array.from(value.values()).map(clone))
    }
    if (value instanceof Map) {
        return new Map(Array.from(value.entries()).map(clone))
    }
    if (Array.isArray(value)) {
        return value.map(clone)
    }
    let newValues = {}
    for (let name in value) {
        newValues[name] = clone(value[name])
    }
    let copy = new value.constructor(newValues)
    return copy
}

export function freeze(object: any, deep: boolean = true) {
    if (object != null && typeof object === 'object') {
        Object.freeze(object)
        if (deep) {
            for (let name in object) {
                freeze(object[name])
            }
        }
    }
}

export function SemanticError(message: string, location: any) {
    let error: any = new Error(message)
    error.location = location.location || location
    return error
}

export function toMap<V>(object: { [name: string]: V }): Map<string,V> {
    let result = new Map<string,V>()
    for (let name in object) {
        result.set(name, object[name])
    }
    return result
}

export function mapValues<K,I,O>(object: Map<K,I>, fn: (I, K) => O): Map<K,O> {
    let result = new Map<K,O>()
    for (let key of object.keys()) {
        let value = object.get(key)
        result.set(key, fn(value, key))
    }
    return result
}

////////////////////////////////////////////////////////////////////////////////
//  Set Functions
////////////////////////////////////////////////////////////////////////////////

export function union(a: Set<any>, b: Set<any>) {
    let result = new Set<any>()
    for (let e of a)
        result.add(e)
    for (let e of b)
        result.add(e)
    return result
}

export function intersection(a: Set<any>, b: Set<any>) {
    let result = new Set<any>()
    for (let e of a) {
        if (b.has(e))
            result.add(e)
    }
    return result
}

export function difference(a: Set<any>, b: Set<any>) {
    let result = new Set<any>()
    for (let e of a) {
        if (!b.has(e))
            result.add(e)
    }
    return result
}

////////////////////////////////////////////////////////////////////////////////
//  File operations
////////////////////////////////////////////////////////////////////////////////

export function read(file: any) {
    return fs.readFileSync(file, 'utf8')
}

export function getPathFromFilename(filename: string) {
    return filename.substring(0, filename.length - '.ion'.length).replace(/[\/\\]/g, '.')
}

export function getInputFilesRecursive(directory: string | string[], rootDirectory : string | null = null, allFiles: {[path: string]: string} = {}): {[path: string]: string} {
    if (Array.isArray(directory)) {
        for (let dir of directory) {
            getInputFilesRecursive(dir, dir, allFiles)
        }
    }
    else {
        if (rootDirectory == null)
            rootDirectory = directory
        for (let name of fs.readdirSync(directory)) {
            let filename = np.join(directory, name)
            let fileInfo = fs.statSync(filename)
            if (fileInfo.isFile()) {
                if (name.endsWith(".ion")) {
                    let path = getPathFromFilename(filename.substring(rootDirectory.length + 1))
                    allFiles[path] = read(filename)
                }
            }
            else {
                getInputFilesRecursive(filename, rootDirectory, allFiles)
            }
        }
    }
    return allFiles
}

export function exists(file: string) {
    return fs.existsSync(file)
}

export function makeDirectories(dir: string) {
    if (!exists(dir)) {
        // make parent first
        makeDirectories(np.dirname(dir))
        // make self
        fs.mkdirSync(dir)
    }
}

export function write(file:string, content:string, encoding?:string) {
    makeDirectories(np.dirname(file))
    if (content != null) {
        if (encoding === undefined && typeof content === 'string')
            encoding = 'utf8'
        fs.writeFileSync(file, content, {encoding})
    }
    else if (exists(file)) {
        fs.unlinkSync(file)
    }
}
