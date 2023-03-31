import { Immutable } from "./Immutable";
import { SourceLocation } from "./SourceLocation";

export class AstNode extends Immutable {

    constructor(
        public readonly location: SourceLocation
    ) {
        super();
    }

    /**
     * returns the key used to get this nodes scope.
     */
    public get scopeKey() {
        return `${this.location.filename}:${this.location.startIndex}`;
    }

    toString(user?: boolean) {
        return super.toString();
    }

    public toUserString(): string {
        return this.toString(true);
    }

    toBlockString(user = false, nodes: AstNode[], open = "{", close = "}", indent = '    ') {
        if (nodes == null || nodes.length === 0) {
            return `${open}${close}`;
        }
        return (`${open}\n${nodes.map(n => n.toString(user)).join(`\n`).split(`\n`).map(a => indent + a).join(`\n`)}\n${close}`);
    }

}