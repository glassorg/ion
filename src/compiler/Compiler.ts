import { Declaration, AnalyzedDeclaration, ParsedDeclaration } from "./ast/Declaration";
import { createLogger } from "./Logger";
import { FileSystem } from "./filesystem/FileSystem";
import { createParser } from "./parser/createParser";
import { SemanticError } from "./SemanticError";
import { defineGraphFunctions, GraphBuilder, GraphExecutionNodeState, GraphExecutor } from "@glas/graph";
import { getAbsolutePath } from "./common/pathFunctions";
import * as phases from "./phases/index";

export interface CompilerOptions {
    debugPattern?: RegExp;
}

type ObjectMap<T> = { [name: string]: T };
//  you MUST omit the 'this' parameter or else it messes up the graph type checking.
type CompilerGraphFunctions = ReturnType<OmitThisParameter<typeof Compiler.prototype.createCompilerGraphFunctions>>;

export class Compiler {

    private readonly parser = createParser();
    private readonly filePattern = /\.ion$/;
    private readonly sourceExecutor: GraphExecutor<CompilerGraphFunctions>;
    private readonly soloExecutor: GraphExecutor<CompilerGraphFunctions>;
    private readonly functions: CompilerGraphFunctions;
    
    constructor(
        public readonly fileSystem: FileSystem,
        options: CompilerOptions = {},
        private readonly logger = createLogger(options.debugPattern)
    ) {
        this.functions = this.createCompilerGraphFunctions();
        this.sourceExecutor = new GraphExecutor(this.functions);
        this.soloExecutor = new GraphExecutor(this.functions);
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

    async getAllSourceFilenames() {
        return await this.fileSystem.find(this.filePattern);
    }

    mergeAllDeclarations(moduleDeclarations: ParsedDeclaration[][]): ParsedDeclaration[] {
        const map = new Map<string, ParsedDeclaration>();
        for (const declarations of moduleDeclarations) {
            for (const declaration of declarations) {
                if (map.has(declaration.absolutePath)) {
                    throw new Error(`Collision at absolute path: ${declaration.absolutePath}`);
                }
                map.set(declaration.absolutePath, declaration);
            }
        }
        return [...map.values()];
    }

    createCompilerGraphFunctions() {
        return defineGraphFunctions({
            parseSourceToDeclarations: async (filename: string, source: string): Promise<ParsedDeclaration[]> => {
                const mod = this.parser.parseModule(filename, source);
                const declarations = mod.declarations.map(d => d.patch({ absolutePath: getAbsolutePath(d.location.filename, d.id.name) }));
                return declarations;
            },
            //  convert from a parsed declaration into an analyzed declaration.
            parsedDeclarationToAnalyzedDeclaration: async (declaration: ParsedDeclaration): Promise<AnalyzedDeclaration> => {
                //  do the solo semantic analysis
                await phases.semanticAnalysisSolo(declaration);
                //  get externals
                const possibleExternals = await phases.getPossibleExternalReferences(declaration);
                console.log("MY PERSONAL EXTERNALS?", possibleExternals);
                return declaration.patch({ possibleExternals });
            }
        });
        //     semanticAnalysisSolo: this.wrapWithLogs(phases.semanticAnalysisSolo),
        //     getPossibleExternalReferences: phases.getPossibleExternalReferences,
        //     getValueFromMap: async (map, name) => map[name],
        //     readFile: async (filename) => await this.fileSystem.read(filename),
        //     parse: async (filename, source) => {
        //         if (typeof source === "string") {
        //             const mod = this.parser.parseModule(filename, source);
        //             return mod.declarations.map(d => d.patch({ absolutePath: getAbsolutePath(d.location.filename, d.id.name) }));
        //         }
        //         return [];
        //     },
        //     mergeAllDeclarations: async (...moduleDeclarations) => {
        //         let result = Object.fromEntries(moduleDeclarations.flat(1).map(d => [d.absolutePath, d]));
        //         // should likely check and throw errors if there are any collisions.
        //         // console.log(Object.keys(result));
        //         return result;
        //     },
        //     finalizeCompilation: async (...declarations) => {
        //         console.log("!!!!!!! finalizeCompilation");
        //     },
        //     getCompiledDeclaration: async (absolutePath: string) => {
        //         return op("compileDeclaration", op("getSoloDeclaration", absolutePath))
        //     },
        //     getAllSoloDeclarationsFromFilenames: async (filenames: string[]) => {
        //         return op(
        //             "mergeAllDeclarations",
        //             ...filenames.map(filename => op("parse", filename, op("readFile", filename)))
        //         );
        //     },
        //     compileDeclaration: async (soloDeclaration) => {
        //         if (!soloDeclaration) {
        //             return undefined;
        //         }
        //         return op("compileDeclarationWithExternalPaths", soloDeclaration, op("getPossibleExternalReferences", soloDeclaration));
        //     },
        //     compileDeclarationWithExternalPaths: async (declaration, externals) => {
        //         return op("compileDeclarationWithExternalDeclarations",
        //             op("semanticAnalysisSolo", declaration),
        //             ...externals.map(external => op("getCompiledDeclaration", external))
        //         );
        //     },
        //     compileDeclarationWithExternalDeclarations: async (declaration, ...externalDeclarations) => {
        //         return declaration;
        //     },
        //     getAllSoloDeclarations: async () => op("getAllSoloDeclarationsFromFilenames", op("getAllSourceFilenames")),
        //     compileDeclarations: async (declarations: ObjectMap<ParsedDeclaration>) => {
        //         let compileOperations = Object.values(declarations).map((declaration) => {
        //             return op("compileDeclaration", declaration);
        //         });
        //         return op("finalizeCompilation", ...compileOperations);
        //     },
        //     getSoloDeclaration: async (absolutePath: string) => {
        //         return op("getValueFromMap", op("getAllSoloDeclarations"), absolutePath );
        //     },
        //     compileAllSoloDeclarations: async () => op("compileDeclarations", op("getAllSoloDeclarations")),
        //     getPossibleExternalReferencesByAbsolutePath: async (absolutePath: string) => {
        //         return op("getPossibleExternalReferences", op("getSoloDeclaration", absolutePath));
        //     },
        // }));
    }

    async getAllParsedDeclarations() {
        const builder = new GraphBuilder<CompilerGraphFunctions>({});
        for (const filename of await this.getAllSourceFilenames()) {
            //  this is sub-optimally sequential.
            const source = (await this.fileSystem.read(filename))!;
            builder.append(`parse:${filename}`, "parseSourceToDeclarations", filename, source);
        }
        this.sourceExecutor.update(builder.build());
        await this.sourceExecutor.execute();
        return this.mergeAllDeclarations(this.sourceExecutor.getOutputsByType("parseSourceToDeclarations"));
    }

    async getAllAnalyzedDeclarations(declarations: ParsedDeclaration[]) {
        const builder = new GraphBuilder<CompilerGraphFunctions>({});
        for (const declaration of declarations) {
            builder.append(`analyze:${declaration.absolutePath}`, "parsedDeclarationToAnalyzedDeclaration", declaration);
        }
        this.soloExecutor.update(builder.build());
        await this.soloExecutor.execute();
        return this.soloExecutor.getOutputsByType("parsedDeclarationToAnalyzedDeclaration");
    }

    async compileAllFiles(): Promise<SemanticError[]> {
        const parsedDeclarations = await this.getAllParsedDeclarations();
        // console.log({ parsedDeclarations });
        const analyzedDeclarations = await this.getAllAnalyzedDeclarations(parsedDeclarations);
        console.log(analyzedDeclarations);
        // TODO: do the external analysis portion.
        return [];
        // first, compile all source files.
        // now build the source graph

        // this.create("compileAllSoloDeclarations");
        // try {
        //     await this.graph.execute();
        // }
        // catch (e) {
        //     console.log("COMPILER ERROR", e);
        //     return [e as SemanticError].flat();
        // }
        // finally {
        //     // now traverse the graph and find all errors.
        //     console.log("final logger");
        //     this.logger();
        // }
        // return [];
    }

    async toConsoleMessage(error: SemanticError) {
        return error.toConsoleString(async (filename) => await this.fileSystem.read(filename) ?? "");
    }

    //  1. Parse Declarations from File
    //  2. All Declarations are parsed into their namespace.
    //  3. All Declarations semantically parsed into Declarations with potential external dependencies.
    //  4. All Declarations completely compiled in order of dependencies.

}
