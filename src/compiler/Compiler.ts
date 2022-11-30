import { Declaration } from "./ast/Declaration";
import { createLogger } from "./Logger";
import { FileSystem } from "./filesystem/FileSystem";
import { createParser } from "./parser/createParser";
import { SemanticError } from "./SemanticError";
import { createGraphOperation, GraphExecutor, GraphOutputType } from "@glas/graph";
import { getAbsolutePath } from "./common/pathFunctions";

type Filename = string;
type AbsoluteName = string;

export interface CompilerOptions {
    debugPattern?: RegExp;
}

type DeclarationMap = { [name: AbsoluteName]: Declaration };

type CompilerGraphFunctions = ReturnType<typeof Compiler.prototype.createGraphFunctions>;

export class Compiler {

    private readonly parser = createParser();
    private readonly filePattern = /\.ion$/;
    private readonly graph: GraphExecutor<CompilerGraphFunctions>;
    
    constructor(
        public readonly fileSystem: FileSystem,
        options: CompilerOptions = {},
        private readonly logger = createLogger(options.debugPattern)
    ) {
        this.graph = new GraphExecutor(this.createGraphFunctions());
    }

    createGraphFunctions() {
        const functions_0 = {
            getAllSourceFilenames: async () => {
                return await this.fileSystem.find(this.filePattern);
            },
            readFile: async (filename: string): Promise<string | null> => {
                return await this.fileSystem.read(filename);
            },
            parse: async (filename: string, source: string | null): Promise<Declaration[]> => {
                if (typeof source === "string") {
                    const mod = this.parser.parseModule(filename, source);
                    //         this.logger("parsed", declaration, absolutePath);

                    return mod.declarations;
                }
                return [];
            },
            mergeAllDeclarations: async (...moduleDeclarations: Declaration[][]): Promise<DeclarationMap> => {
                // maybe use the filename of the source to get the real absolute id.
                // console.log(moduleDeclarations);
                let result = Object.fromEntries(moduleDeclarations.flat(1).map(d => [getAbsolutePath(d.location.filename, d.id.name), d]));
                console.log(Object.keys(result));
                return result;
            }
        };
        const functions_1 = {
            ...functions_0,
            getAllDeclarationsFromFilenames: async (filenames: string[]) => {
                return createGraphOperation<typeof functions_0, "mergeAllDeclarations">(
                    "mergeAllDeclarations",
                    ...filenames.map(filename => {
                        return createGraphOperation<typeof functions_0, "parse">("parse", filename, createGraphOperation<typeof functions_0, "readFile">("readFile", filename));
                    })
                );
            },
        }
        return {
            ...functions_1,
            getAllDeclarations: async () => {
                return createGraphOperation<typeof functions_1, "getAllDeclarationsFromFilenames">(
                    "getAllDeclarationsFromFilenames",
                    createGraphOperation<typeof functions_1, "getAllSourceFilenames">("getAllSourceFilenames")
                );
            },
            compileAllDeclarations: async () => {
                throw new Error("Stuff");
            }
        }
    }

    async compileAllFiles(): Promise<SemanticError[]> {
        this.graph.create("getAllDeclarations");
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
        //         let absolutePath = getAbsolutePath(file, declaration.id.name);
        //         this.logger("parsed", declaration, absolutePath);
        //         let [semanticDeclaration, semanticErrors] = semanticAnalysisSolo(declaration);
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



