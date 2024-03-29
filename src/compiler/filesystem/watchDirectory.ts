import * as fs from "fs";
import * as np from "path";

type Filter = string[] | RegExp | string | { [name: string]: boolean } | ((value: string) => boolean);

type WatchOptions = {
    persistent?: boolean
    interval?: number
    recursive?: boolean
    include?: Filter
    exclude?: Filter
    initial?: boolean
}
type WatchListener = (filename: string, previous: fs.Stats, current: fs.Stats, change: WatchChange) => void
type WatchChange = "initial" | "deleted" | "created" | "modified"
export default function watchDirectory(dirname: string, options: WatchOptions, listener: WatchListener) {
    let {
        persistent = true,
        interval = 50,
        recursive = true,
        include,
        exclude = { node_modules: true },
    } = options
    let initial: WatchChange | null = options.initial ? "initial" : null
    function matches(name: string, filter?: Filter, defaultValue = false) {
        if (filter == null) {
            return defaultValue
        }
        if (Array.isArray(filter)) {
            return filter.indexOf(name) >= 0
        }
        if (typeof filter === "string") {
            let ext = filter
            return name.indexOf(ext, name.length - ext.length) >= 0
        }
        if (typeof filter === "function") {
            return filter(name)
        }
        if (filter instanceof RegExp) {
            return filter.test(name)
        }
        return filter[name] === true
    }

    function filter(name: string) {
        if (matches(name, exclude, false)) {
            return false
        }
        return matches(name, include, true)
    }

    let watchedFiles: any = {}

    function notifyListener(filename: string, current: fs.Stats, previous: fs.Stats, change: WatchChange) {
        if (filter(filename)) {
            listener(filename, current, previous, change)
        }
    }
    function unwatchFile(filename: string) {
        fs.unwatchFile(filename, watchedFiles[filename])
        delete watchedFiles[filename]
    }
    function watchFile(filename: string, depth = 0, stats = fs.statSync(filename)) {
        if (stats.nlink > 0) {
            if (stats.isDirectory()) {
                if (!matches(filename, exclude, false)) {
                    if (depth === 0 || recursive) {
                        for (let child of fs.readdirSync(filename)) {
                            watchFile(np.join(filename, child), depth + 1)
                        }
                    }
                }
            }
            if (watchedFiles[filename] == null) {
                let boundListener = fsListener.bind(null, filename, depth)
                watchedFiles[filename] = boundListener
                if (persistent) {
                    fs.watchFile(filename, { persistent, interval }, boundListener)
                }
                if (initial != null) {
                    notifyListener(filename, stats, stats, initial)
                }
            }
        }
    }
    let fsListener = (filename: string, depth: number, current: fs.Stats, previous: fs.Stats) => {
        let change: WatchChange = "modified"
        if (current.nlink === 0) {
            change = "deleted"
        }
        if (previous.nlink === 0) {
            change = "created"
        }
        notifyListener(filename, current, previous, change)
        if (change !== "deleted") {
            watchFile(filename, depth, current)
        }
        else {
            unwatchFile(filename)
        }
    }

    watchFile(dirname)
    initial = "created"

    // returns a function which unwatches everything
    return () => {
        for (let filename in watchedFiles) {
            unwatchFile(filename)
        }
    }
}
