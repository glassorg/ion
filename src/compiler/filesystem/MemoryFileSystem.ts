import { Content, FileSystem, Path } from "./FileSystem";

export class MemoryFileSystem extends FileSystem {


    constructor(
        public readonly files: { [path: Path]: Content } = {}
    ) {
        super();
    }

    async exists(path: Path): Promise<boolean> {
        return this.files[path] != null;
    }

    async read(path: Path): Promise<Content> {
        return this.files[path];
    }

    async write(path: Path, content: Content): Promise<void> {
        this.files[path] = content;
    }

    async find(pattern: RegExp): Promise<Path[]> {
        return Object.keys(this.files).filter(path => pattern.test(path));
    }

}