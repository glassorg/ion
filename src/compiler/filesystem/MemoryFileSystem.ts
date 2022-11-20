import { Content, FileSystem, Path } from "./FileSystem";

export class MemoryFileSystem extends FileSystem {


    constructor(
        public readonly files: { [path: Path]: Content } = {}
    ) {
        super();
    }

    exists(path: Path): boolean {
        return this.files[path] != null;
    }

    read(path: Path): Content {
        return this.files[path];
    }

    write(path: Path, content: Content): void {
        this.files[path] = content;
    }

    find(pattern: RegExp): Path[] {
        return Object.keys(this.files).filter(path => pattern.test(path));
    }

}