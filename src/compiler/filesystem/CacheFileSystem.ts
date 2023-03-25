import { Content, FileSystem, Path } from "./FileSystem";
import * as np from "path";
import * as fileUtility from "./fileUtility";
import { memoize } from "@glas/kype";

export class CacheFileSystem extends FileSystem {

    private cache: Record<string,string|null> = {};

    constructor(
        private readonly inner: FileSystem
    ) {
        super();
    }

    async exists(path: Path): Promise<boolean> {
        return this.inner.exists(path);
    }

    async read(path: Path): Promise<Content | null> {
        if (this.cache[path] === undefined) {
            this.cache[path] = await this.inner.read(path)!;
        }
        return this.cache[path];
    }

    async write(path: Path, content: Content): Promise<void> {
        this.cache[path] = content;
        return await this.inner.write(path, content);
    }

    async find(pattern: RegExp): Promise<Path[]> {
        return await this.inner.find(pattern);
    }

}