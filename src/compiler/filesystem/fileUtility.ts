import * as fs from "fs";
import * as np from "path";


////////////////////////////////////////////////////////////////////////////////
//  File operations
////////////////////////////////////////////////////////////////////////////////

export function getFilesRecursive(directory: string, pattern?: RegExp, rootDirectory = directory, allFiles = new Array<string>()) {
    for (let name of fs.readdirSync(directory)) {
        let filename = np.join(directory, name)
        let fileInfo = fs.statSync(filename)
        if (fileInfo.isFile()) {
            let relativeFilename = np.relative(rootDirectory, filename)
            if (pattern == null || pattern.test(relativeFilename)) {
                allFiles.push(relativeFilename)
            }
        }
        else {
            getFilesRecursive(filename, pattern, rootDirectory, allFiles)
        }
    }
    return allFiles
}

export function findPackage(dir = process.cwd()): string | null {
    let checkFilename = np.join(dir, "package.json")
    // console.log("check", checkFilename)
    if (fs.existsSync(checkFilename)) {
        return require(checkFilename)
    }
    let newDir = np.dirname(dir)
    if (newDir != dir) {
        return findPackage(newDir)
    }
    return null
}

export function read(file: string) {
    return fs.readFileSync(file, 'utf8')
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

export function write(file: string, content: string, options: fs.WriteFileOptions = { encoding: "utf8" }) {
    makeDirectories(np.dirname(file))
    if (content != null) {
        fs.writeFileSync(file, content, options);
    }
    else if (exists(file)) {
        fs.unlinkSync(file)
    }
}
