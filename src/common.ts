import * as fs from "fs";
import * as np from "path";
import { Module } from "./ast";

////////////////////////////////////////////////////////////////////////////////
//  Miscelaneous Functions
////////////////////////////////////////////////////////////////////////////////

export function clone(value) {
    if (value == null || typeof value !== "object") {
        return value
    }
    let copy = new value.constructor()
    for (let name in value) {
        copy[name] = clone(value[name])
    }
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

export function mapValues<I,O>(object: { [name: string]: I }, fn: (I, string) => O) {
    let result: { [name: string]: O } = {}
    for (let name in object) {
        result[name] = fn(object[name], name)
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
