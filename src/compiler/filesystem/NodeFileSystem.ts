import { Content, FileSystem, Path } from "./FileSystem";
import * as np from "path";
import * as fileUtility from "./fileUtility";

export class NodeFileSystem extends FileSystem {

    constructor(
        private root: Path
    ) {
        super();
    }

    private toAbsolute(path: Path): Path {
        return np.join(this.root, path);
    }

    async exists(path: Path): Promise<boolean> {
        return fileUtility.exists(this.toAbsolute(path));
    }

    async read(path: Path): Promise<Content> {
        return fileUtility.read(this.toAbsolute(path));
    }

    async write(path: Path, content: Content): Promise<void> {
        return fileUtility.write(this.toAbsolute(path), content);
    }

    async find(pattern: RegExp): Promise<Path[]> {
        return fileUtility.getFilesRecursive(this.root, pattern);
    }

}