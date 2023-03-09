import { AstNode } from "./ast/AstNode";
import { SourceLocation } from "./ast/SourceLocation";
import ErrorContext from "./errors/ErrorContext";

export class SemanticError extends Error {

    locations: SourceLocation[];

    constructor(message: string, ...nodes: (AstNode | SourceLocation | undefined)[]) {
        super(message);
        this.name = this.constructor.name;
        this.locations = [...new Set(nodes.filter(node => node != null).map(node => node instanceof AstNode ? node.location : node) as SourceLocation[])];
    }

    toConsoleString(sources: Record<string,string>) {
        if (this.locations.length === 0) {
            return super.toString();
        }
        const filename = this.locations[0].filename;
        if (!filename) {
            console.error(`SemanticError.Filename not found: ${JSON.stringify(filename)}`);
            return this.toString();
        }
        let source = sources[filename];
        if (!source) {
            console.error(`SemanticError.Source not found: ${JSON.stringify(filename)}`);
            return this.toString();
        }
        let errorContext = new ErrorContext(source, filename);
        let error = errorContext.getError(this.message, ...this.locations);
        return error.message;
    }

    toString() {
        return this.message + (this.stack ?? "");
    }

}
