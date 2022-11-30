import { AstNode } from "./ast/AstNode";
import { SourceLocation } from "./ast/SourceLocation";
import ErrorContext from "./errors/ErrorContext";

export class SemanticError extends Error {

    locations: SourceLocation[];

    constructor(message: string, ...nodes: (AstNode | SourceLocation | undefined)[]) {
        super(message);
        this.name = this.constructor.name;
        this.locations = nodes.filter(node => node != null).map(node => node instanceof AstNode ? node.location : node) as SourceLocation[];
    }

    async toConsoleString(getSource?: (filename: string) => Promise<string>) {
        if (!getSource || this.locations.length === 0) {
            return super.toString();
        }
        const filename = this.locations[0].filename;
        if (filename == null) {
            throw new Error("Filename not found: " + filename);
        }
        const source = await getSource(filename);
        if (source == null) {
            throw new Error("Source not found: " + filename);
        }
        let errorContext = new ErrorContext(source, filename);
        let error = errorContext.getError(this.message, ...this.locations);
        return error.message;
    }

}
