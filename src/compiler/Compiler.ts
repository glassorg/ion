import { AnalyzedDeclaration, MaybeResolvedDeclaration, ParsedDeclaration, ResolvedDeclaration } from "./ast/Declaration";
import { createLogger } from "./Logger";
import { FileSystem } from "./filesystem/FileSystem";
import { createParser } from "./parser/createParser";
import { SemanticError } from "./SemanticError";
import { CircularReferenceError, defineGraphFunctions, equals, GraphExecutor } from "@glas/graph";
import { getAbsolutePath } from "./common/pathFunctions";
import { resolveExternalReferences } from "./phases/resolveExternalReferences";
import { resolveSingleStep } from "./phases/resolveSingleStep";
import { semanticAnalysis } from "./phases/semanticAnalysis";
import * as phases from "./phases/index";
import { mergeAllDeclarations } from "./phases/mergeAllDeclarations";

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
    private readonly analyzeExecutor: GraphExecutor<CompilerGraphFunctions>;
    private readonly compileExecutor: GraphExecutor<CompilerGraphFunctions>;
    private readonly functions: CompilerGraphFunctions;

    constructor(
        public readonly fileSystem: FileSystem,
        private readonly options: CompilerOptions = {},
        private readonly logger = createLogger(options.debugPattern)
    ) {
        this.functions = this.createCompilerGraphFunctions();
        this.parseExecutor = new GraphExecutor(this.functions);
        this.analyzeExecutor = new GraphExecutor(this.functions);
        this.compileExecutor = new GraphExecutor(this.functions);
    }

    async getAllSourceFilenames() {
        return await this.fileSystem.find(this.filePattern);
    }

    log<T extends ParsedDeclaration>(name: string, declaration: T): T {
        this.logger(name, declaration, declaration.absolutePath);
        return declaration;
    }

    createCompilerGraphFunctions() {
        return defineGraphFunctions({
            parse: async (filename: string, source: string): Promise<ParsedDeclaration[]> => {
                const mod = this.parser.parseModule(filename, source);
                const declarations = mod.declarations.map(d => d.patch({
                    absolutePath: getAbsolutePath(d.location.filename, d.id.name),
                }).toAstDeclarations()).flat();
                return declarations;
            },
            analyze: async (declaration: ParsedDeclaration): Promise<AnalyzedDeclaration> => {
                //  do the solo semantic analysis
                declaration = this.log(`semanticAnalysisSolo`, await phases.semanticAnalysisSolo(declaration));
                //  get externals
                const externals = await phases.getPossibleExternalReferences(declaration);
                const analyzed = this.log(`getPossibleExternalReferences`, declaration.patch({ externals }));
                return analyzed;
            },
            resolveSolo: async (declaration: AnalyzedDeclaration, ...externals: ResolvedDeclaration[]): Promise<MaybeResolvedDeclaration> => {
                declaration = resolveExternalReferences(declaration, externals);
                this.log(`resolveExternalReferences`, declaration);

                declaration = semanticAnalysis(declaration, externals);
                this.log(`semanticAnalysis`, declaration);

                //  add in N phases of solo resolution
                for (let i = 0; i < 100; i++) {
                    const before = declaration;
                    declaration = resolveSingleStep(declaration, this.log.bind(this), externals, `resolveSolo ${i}`);
                    if (equals(before, declaration)) {
                        // console.log(`${declaration.absolutePath} EQUALS ${i}`);
                        break;
                    }
                }

                // don't automatically patch a declaration as resolved.
                return declaration;
            }
        });
    }

    async getAllParsedDeclarations(): Promise<ParsedDeclaration[]> {
        const builder = this.parseExecutor.builder();
        for (const filename of await this.getAllSourceFilenames()) {
            //  this is sub-optimally sequential.
            const source = (await this.fileSystem.read(filename))!;
            builder.append(`parse:${filename}`, "parse", filename, source);
        }
        this.parseExecutor.update(builder.build());
        await this.parseExecutor.execute();
        return mergeAllDeclarations(this.parseExecutor.getOutputsByType("parse"));
    }

    async getAllAnalyzedDeclarations(declarations: ParsedDeclaration[]): Promise<AnalyzedDeclaration[]> {
        const builder = this.analyzeExecutor.builder();
        for (const declaration of declarations) {
            builder.append(`analyze:${declaration.absolutePath}`, "analyze", declaration);
        }
        this.analyzeExecutor.update(builder.build());
        await this.analyzeExecutor.execute();
        return this.analyzeExecutor.getOutputsByType("analyze");
    }

    async getMaybeResolvedDeclarations(declarations: AnalyzedDeclaration[]): Promise<MaybeResolvedDeclaration[]> {
        const builder = this.compileExecutor.builder();
        const lookup = new Map(declarations.map(d => [d.absolutePath, d]));
        for (const declaration of declarations) {
            const externalRefs = declaration.externals.filter(e => lookup.has(e)).map(e => ({ ref: e }));
            //  externalRefs as any because the graph doesn't know that these references are valid yet.
            builder.append(declaration.absolutePath, "resolveSolo", declaration, ...externalRefs as any);
        }
        try {
            this.compileExecutor.update(builder.build());
        }
        catch (e) {
            if (e instanceof CircularReferenceError) {
                // convert a circular reference error to a semantic error.
                // console.log(JSON.stringify(e.path.map(name => lookup.get(name)!.id.location), null, 2));
                e = new SemanticError(e.message, ...e.path.map(name => lookup.get(name)!.id));
            }
            throw e;
        }
        await this.compileExecutor.execute();
        return this.compileExecutor.getOutputsByType("resolveSolo");
    }

    async compileAllFiles(): Promise<MaybeResolvedDeclaration[]> {
        try {
            const parsedDeclarations = await this.getAllParsedDeclarations();
            const analyzedDeclarations = await this.getAllAnalyzedDeclarations(parsedDeclarations);
            const maybeResolvedDeclarations = await this.getMaybeResolvedDeclarations(analyzedDeclarations);
            // next we have to do combined resolution.
            return maybeResolvedDeclarations;
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
