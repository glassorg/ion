import { Declaration, RootDeclaration } from "./ast/Declaration";
import { createLogger } from "./Logger";
import { FileSystem } from "./filesystem/FileSystem";
import { createParser } from "./parser/createParser";
import { SemanticError } from "./SemanticError";
import { defineGraphFunctions, GraphExecutor } from "@glas/graph";
import { getAbsolutePath } from "./common/pathFunctions";
import { Assembly } from "./ast/Assembly";
import { assemblyPhases } from "./phases/assembly";
import { isGloballyScoped } from "./ast/FunctionDeclaration";
import { repeatSuffix } from "./phases/assembly/resolveSingleStep";

export interface CompilerOptions {
    debugPattern?: RegExp;
}

export class CompileError extends Error {

    constructor(public readonly semanticErrors: SemanticError[]) {
        super(semanticErrors.join(`\n`));
    }

}

//  you MUST omit the 'this' parameter or else it messes up the graph type checking.
type CompilerGraphFunctions = ReturnType<OmitThisParameter<typeof Compiler.prototype.createCompilerGraphFunctions>>;

export class Compiler {

    private readonly parser = createParser();
    private readonly filePattern = /\.ion$/;
    private readonly parseExecutor: GraphExecutor<CompilerGraphFunctions>;
    // private readonly analyzeExecutor: GraphExecutor<CompilerGraphFunctions>;
    // private readonly compileExecutor: GraphExecutor<CompilerGraphFunctions>;
    private readonly functions: CompilerGraphFunctions;

    constructor(
        public readonly fileSystem: FileSystem,
        private readonly options: CompilerOptions = {},
        private readonly logger = createLogger(options.debugPattern)
    ) {
        this.functions = this.createCompilerGraphFunctions();
        this.parseExecutor = new GraphExecutor(this.functions);
        // this.analyzeExecutor = new GraphExecutor(this.functions);
        // this.compileExecutor = new GraphExecutor(this.functions);
    }

    async getAllSourceFilenames() {
        return await this.fileSystem.find(this.filePattern);
    }

    log<T extends RootDeclaration>(name: string, declaration: T): T {
        this.logger(name, declaration, declaration.absolutePath);
        return declaration;
    }

    createCompilerGraphFunctions() {
        return defineGraphFunctions({
            parse: async (filename: string, source: string): Promise<RootDeclaration[]> => {
                const mod = this.parser.parseModule(filename, source);
                const declarations = mod.declarations.map((d, index) => {
                    const globalScoped = isGloballyScoped(d);
                    let absolutePath = getAbsolutePath(d.location.filename, d.id.name, ...(globalScoped ? [index.toString()] : []));
                    d = d.patch({ absolutePath });
                    if (!globalScoped) {
                        d = d.patch({ id: d.id.patch({ name: absolutePath })});
                    }
                    return d as RootDeclaration;
                }).flat();
                return declarations;
            },
        });
    }

    async getAllParsedDeclarations(): Promise<RootDeclaration[]> {
        const builder = this.parseExecutor.builder();
        for (const filename of await this.getAllSourceFilenames()) {
            //  this is sub-optimally sequential.
            const source = (await this.fileSystem.read(filename))!;
            builder.append(`parse:${filename}`, "parse", filename, source);
        }
        this.parseExecutor.update(builder.build());
        await this.parseExecutor.execute();
        return this.parseExecutor.getOutputsByType("parse").flat();
    }

    compileAssembly(assembly: Assembly): Assembly {
        for (const phase of assemblyPhases) {
            const repeat = phase.name.endsWith(repeatSuffix);
            for (let i = 0; i < (repeat ? 100 : 1); i++) {
                const name = repeat ? phase.name.slice(0, -repeatSuffix.length) + `_${i}` : phase.name;
                const before = assembly;
                assembly = phase(assembly);
                // log entire assembly as well.
                this.logger(name, assembly, "Assembly");
                for (const declaration of assembly.declarations) {
                    this.log(name, declaration);
                }
                if (assembly.toString() === before.toString()) {
                    break;
                }
            }
        }
        return assembly;
    }

    async compileAllFiles(): Promise<Assembly> {
        try {
            const parsedDeclarations = await this.getAllParsedDeclarations();
            // const analyzedDeclarations = await this.getAllAnalyzedDeclarations(parsedDeclarations);
            // const maybeResolvedDeclarations = await this.getMaybeResolvedDeclarations(analyzedDeclarations);
            // next we have to do combined resolution.
            const assembly = this.compileAssembly(new Assembly(parsedDeclarations));
            return assembly;
        }
        catch (e) {
            if (e instanceof SemanticError || Array.isArray(e)) {
                const errors = [e as SemanticError | SemanticError[]].flat()
                if (this.options.debugPattern) {
                    for (const error of errors) {
                        console.log(await this.toConsoleMessage(error));
                    }
                }
                throw new CompileError(errors);
            }
            else {
                console.log(e);
                throw e;
            }
        }
        finally {
            // now traverse the graph and find all errors.
            this.logger();
        }
    }

    async toConsoleMessage(error: SemanticError) {
        return error.toConsoleString(async (filename) => await this.fileSystem.read(filename) ?? "");
    }

    //  [x] 1. Parse Declarations from File
    //  [x] 2. All Declarations are parsed into their namespace.
    //  [x] 3. All Declarations semantically parsed into Declarations with potential external dependencies.
    //  [ ] 4. All Declarations completely compiled in order of dependencies.

}
