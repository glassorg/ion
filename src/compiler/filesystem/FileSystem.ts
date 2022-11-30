
export type Path = string;
export type Content = string;

export abstract class FileSystem {

    abstract exists(path: Path): Promise<boolean>;
    abstract read(path: Path): Promise<Content | null>;
    abstract write(path: Path, value: Content): Promise<void>;
    abstract find(pattern: RegExp): Promise<Path[]>;

}