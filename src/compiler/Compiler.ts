import { Declaration } from "./ast/Declaration";
import { createLogger } from "./Logger";
import { FileSystem, Path } from "./filesystem/FileSystem";
import { createParser } from "./parser/createParser";
import { getAbsolutePath } from "./common/pathFunctions";
import { semanticAnalysisSolo } from "./phases/semanticAnalysisSolo";
import { SemanticError } from "./SemanticError";

type Filename = string;
type AbsoluteName = string;

export class Compiler {

    private readonly parser = createParser();
    private readonly logger = createLogger("foo.bar.y", "foo.bar.max");

    constructor(
        public readonly fileSystem: FileSystem,
        public readonly filePattern = /\.ion$/,
    ) {
    }

    private readonly fileToDeclarationsCache = new Map<Filename,Declaration[]>();
    getDeclarationsFromFile(path: Path): Declaration[] {
        if (!this.fileSystem.exists(path)) {
            throw new Error(`File does not exist: ${path}`);
        }
        let source = this.fileSystem.read(path);
        let cacheKey = path + source;
        let declarations = this.fileToDeclarationsCache.get(cacheKey);
        if (!declarations) {
            declarations = this.parser.parseModule(path, source).declarations;
            this.fileToDeclarationsCache.set(cacheKey, declarations);
        }
        return declarations;
    }

    private getAllSourceFilenames() {
        return this.fileSystem.find(this.filePattern);
    }

    // private getAllSources(): Map<Filename, Source> {
    //     // return this.getAllSourceFilenames().map(filename => [filename, this.fileSystem.read()])
    // }

    private readonly declarations = new Map<AbsoluteName, Declaration>();

    compileAllFiles(): SemanticError[] {
        let errors: SemanticError[] = [];
        for (let file of this.getAllSourceFilenames()) {
            for (let declaration of this.getDeclarationsFromFile(file)) {
                let absolutePath = getAbsolutePath(file, declaration.id.name);
                this.logger("parsed", declaration, absolutePath);
                let [semanticDeclaration, semanticErrors] = semanticAnalysisSolo(declaration);
                errors.push(...semanticErrors);
                this.logger("semantic", semanticDeclaration, absolutePath);

                //  resolve the full path to this declaration
                //  semantically analyze this file and then find dependencies
            }
        }
        this.logger();
        return errors;
    }

    toConsoleMessage(error: SemanticError) {
        return error.toString((filename) => this.fileSystem.read(filename));
    }

    //  1. Parse Declarations from File
    //  2. All Declarations are parsed into their namespace.
    //  3. All Declarations semantically parsed into Declarations with potential external dependencies.
    //  4. All Declarations completely compiled in order of dependencies.

}