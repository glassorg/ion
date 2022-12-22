
// const root = ":";
const separator = ".";
const splitter = /[\.\/\\]/;

// export function isAbsolutePath(path: string) {
//     return path.startsWith(root);
// }

export function getAbsolutePath(filename: string, id: string) {
    let basePath = filename.split(splitter).slice(0, -1);
    let last = basePath[basePath.length - 1];
    if (last !== id) {
        basePath.push(id);
    }
    return joinPath(...basePath);
}

export function splitPath(path: string) {
    return path.split(separator);
}

export function joinPath(...steps: string[]) {
    return steps.join(separator);
}