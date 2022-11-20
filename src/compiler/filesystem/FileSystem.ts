
export type Path = string;
export type Content = string;

export abstract class FileSystem {

    abstract exists(path: Path): boolean;
    abstract read(path: Path): Content;
    abstract write(path: Path, value: Content): void;
    abstract find(pattern: RegExp): Path[];

}