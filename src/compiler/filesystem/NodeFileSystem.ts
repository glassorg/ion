import { Content, FileSystem, Path } from "./FileSystem";
import * as np from "path";
import * as fileUtility from "./fileUtility";

export abstract class NodeFileSystem extends FileSystem {

    constructor(
        private root: Path
    ) {
        super();
    }

    private toAbsolute(path: Path): Path {
        return np.join(this.root, path);
    }

    exists(path: Path): boolean {
        return fileUtility.exists(this.toAbsolute(path));
    }

    read(path: Path): Content {
        return fileUtility.read(this.toAbsolute(path));
    }

    write(path: Path, content: Content): void {
        return fileUtility.write(this.toAbsolute(path), content);
    }

    find(pattern: RegExp): Path[] {
        return fileUtility.getFilesRecursive(this.root, pattern);
    }

}