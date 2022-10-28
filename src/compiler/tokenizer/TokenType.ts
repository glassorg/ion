import { Token } from "../ast/Token";

type ValueFunction = (source: string) => any
type Options = {
    value?: ValueFunction,
    mergeAdjacent?: boolean,
    isWhitespace?: boolean,
    discard?: boolean,
    previousPredicate?: (previous: Token | undefined) => boolean
}
const identity = (source: any) => source;

export class TokenType {

    readonly name: string;
    readonly match: (line: string) => number;
    readonly value: ValueFunction;
    readonly mergeAdjacent: boolean;
    readonly isWhitespace: boolean;
    readonly discard: boolean;
    readonly previousPredicate!: (previous: Token | undefined) => boolean

    constructor(name: string, match: RegExp, options?: Options)
    constructor(name: string, match: (line: string) => number, options?: Options)
    constructor(name: string, match: RegExp | ((line: string) => number), options?: Options) {
        if (match instanceof RegExp) {
            const regexp = match;
            match = (line: string) => {
                let result = regexp.exec(line);
                return result != null ? result[0].length : -1;
            }
        }
        this.name = name;
        this.match = match;
        this.value = options?.value ?? identity;
        this.mergeAdjacent = options?.mergeAdjacent ?? false;
        this.isWhitespace = options?.isWhitespace ?? false;
        this.discard = options?.discard ?? false;
    }

    toString() {
        return this.name;
    }

}
