import { AnalyzedDeclaration, ParsedDeclaration } from "./ast/Declaration";
import { createLogger } from "./Logger";
import { FileSystem } from "./filesystem/FileSystem";
import { createParser } from "./parser/createParser";
import { SemanticError } from "./SemanticError";
import { createGraphFunctions, GraphExecutor } from "@glas/graph";
import { getAbsolutePath } from "./common/pathFunctions";
import * as phases from "./phases/index";

export interface CompilerOptions {
    debugPattern?: RegExp;
}

type ObjectMap<T> = { [name: string]: T };
type CompilerGraphFunctions = ReturnType<typeof Compiler.prototype.createCompilerGraphFunctions>;

export class Compiler {

    private readonly parser = createParser();
    private readonly filePattern = /\.ion$/;
    private readonly graph: GraphExecutor<CompilerGraphFunctions>;
    
    constructor(
        public readonly fileSystem: FileSystem,
        options: CompilerOptions = {},
        private readonly logger = createLogger(options.debugPattern)
    ) {
        this.graph = new GraphExecutor(this.createCompilerGraphFunctions());
    }

    /**
     * Returns a function signature with the same arguments but wrapped in a logger call.
     */
    wrapWithLogs<P extends unknown[], T>(func: (root: ParsedDeclaration, ... params: P) => Promise<T>): (root: ParsedDeclaration, ... params: P) => Promise<T>{
        return async (root, ...args: P) => {
            const result = await func(root, ...args);
            this.logger(func.name, result as any, root.absolutePath);
            return result;
        }
    }

    createCompilerGraphFunctions() {
        return createGraphFunctions<{
            semanticAnalysisSolo(root: ParsedDeclaration): AnalyzedDeclaration,
            getPossibleExternalReferences(root?: ParsedDeclaration): string[],
            getAllSourceFilenames(): string[],
            getValueFromMap<T>(map: ObjectMap<ParsedDeclaration>, name: string): ParsedDeclaration | undefined,
            readFile(filename: string): string | null,
            parse(filename: string, source: string | null): ParsedDeclaration[],
            mergeAllDeclarations(...moduleDeclarations: ParsedDeclaration[][]): ObjectMap<ParsedDeclaration>,
            finalizeCompilation(...declarations: (ParsedDeclaration | undefined)[]): void,
            compileDeclaration(soloDeclaration?: ParsedDeclaration): ParsedDeclaration | undefined,
            getAllSoloDeclarationsFromFilenames(filenames: string[]): ObjectMap<ParsedDeclaration>,
            getAllSoloDeclarations(): ObjectMap<ParsedDeclaration>,
            compileDeclarations(declarations: ObjectMap<ParsedDeclaration>): void,
            getSoloDeclaration(absolutePath: string): ParsedDeclaration | undefined,
            getCompiledDeclaration(absolutePath: string): ParsedDeclaration | undefined,
            compileAllSoloDeclarations(): void,
            getPossibleExternalReferencesByAbsolutePath(absolutePath: string): string[],
            compileDeclarationWithExternalPaths(declaration: ParsedDeclaration, externalPaths: string[]): ParsedDeclaration,
            compileDeclarationWithExternalDeclarations(declaration: ParsedDeclaration, ...externalDeclarations: (ParsedDeclaration | undefined)[]): ParsedDeclaration,
        }>(op => ({
            semanticAnalysisSolo: this.wrapWithLogs(phases.semanticAnalysisSolo),
            getPossibleExternalReferences: phases.getPossibleExternalReferences,
            getAllSourceFilenames: async () => await this.fileSystem.find(this.filePattern),
            getValueFromMap: async (map, name) => map[name],
            readFile: async (filename) => await this.fileSystem.read(filename),
            parse: async (filename, source) => {
                if (typeof source === "string") {
                    const mod = this.parser.parseModule(filename, source);
                    return mod.declarations.map(d => d.patch({ absolutePath: getAbsolutePath(d.location.filename, d.id.name) }));
                }
                return [];
            },
            mergeAllDeclarations: async (...moduleDeclarations) => {
                let result = Object.fromEntries(moduleDeclarations.flat(1).map(d => [d.absolutePath, d]));
                // should likely check and throw errors if there are any collisions.
                // console.log(Object.keys(result));
                return result;
            },
            finalizeCompilation: async (...declarations) => {
                console.log("!!!!!!! finalizeCompilation");
            },
            getCompiledDeclaration: async (absolutePath: string) => {
                return op("compileDeclaration", op("getSoloDeclaration", absolutePath))
            },
            getAllSoloDeclarationsFromFilenames: async (filenames: string[]) => {
                return op(
                    "mergeAllDeclarations",
                    ...filenames.map(filename => op("parse", filename, op("readFile", filename)))
                );
            },
            compileDeclaration: async (soloDeclaration) => {
                if (!soloDeclaration) {
                    return undefined;
                }
                return op("compileDeclarationWithExternalPaths", soloDeclaration, op("getPossibleExternalReferences", soloDeclaration));
            },
            compileDeclarationWithExternalPaths: async (declaration, externals) => {
                return op("compileDeclarationWithExternalDeclarations",
                    op("semanticAnalysisSolo", declaration),
                    ...externals.map(external => op("getCompiledDeclaration", external))
                );
            },
            compileDeclarationWithExternalDeclarations: async (declaration, ...externalDeclarations) => {
                return declaration;
            },
            getAllSoloDeclarations: async () => op("getAllSoloDeclarationsFromFilenames", op("getAllSourceFilenames")),
            compileDeclarations: async (declarations: ObjectMap<ParsedDeclaration>) => {
                let compileOperations = Object.values(declarations).map((declaration) => {
                    return op("compileDeclaration", declaration);
                });
                return op("finalizeCompilation", ...compileOperations);
            },
            getSoloDeclaration: async (absolutePath: string) => {
                return op("getValueFromMap", op("getAllSoloDeclarations"), absolutePath );
            },
            compileAllSoloDeclarations: async () => op("compileDeclarations", op("getAllSoloDeclarations")),
            getPossibleExternalReferencesByAbsolutePath: async (absolutePath: string) => {
                return op("getPossibleExternalReferences", op("getSoloDeclaration", absolutePath));
            },
        }));
    }

    async compileAllFiles(): Promise<SemanticError[]> {
        this.graph.create("compileAllSoloDeclarations");
        try {
            await this.graph.execute();
        }
        catch (e) {
            console.log("COMPILER ERROR", e);
            return [e as SemanticError].flat();
        }
        finally {
            // now traverse the graph and find all errors.
            console.log("final logger");
            this.logger();
        }
        return [];

        // for (let file of this.getAllSourceFilenames()) {
        //     for (let declaration of this.getDeclarationsFromFile(file)) {
        //         errors.push(...semanticErrors);
        //         // this.logger("semantic", semanticDeclaration, absolutePath);
        //         let [externals, externalErrors] = getExternalReferences(declaration);
        //         errors.push(...externalErrors);
        //         console.log({ absolutePath, externals });
        //         //  now we know externals names.
        //         //  we can determine all possible named external paths in order to make things dirty on changes.
        //     }
        // }
    }

    async toConsoleMessage(error: SemanticError) {
        return error.toConsoleString(async (filename) => await this.fileSystem.read(filename) ?? "");
    }

    //  1. Parse Declarations from File
    //  2. All Declarations are parsed into their namespace.
    //  3. All Declarations semantically parsed into Declarations with potential external dependencies.
    //  4. All Declarations completely compiled in order of dependencies.

}



