
type ValueFunction = (source: string) => any
type Options = {
    value?: ValueFunction,
    mergeAdjacent?: boolean,
    isWhitespace?: boolean,
    discard?: boolean,
    dent?: boolean,
    newLine?: boolean,
    previousPredicate?: (previous?: TokenType) => boolean
}
const identity = (source: any) => source;

export class TokenType {

    public readonly match: (line: string) => number;
    public readonly value: ValueFunction;
    public readonly mergeAdjacent: boolean;
    public readonly isWhitespace: boolean;
    public readonly discard: boolean;
    public readonly dent: boolean;
    public readonly newLine: boolean;
    public readonly previousPredicate!: (previous?: TokenType) => boolean

    constructor(match: RegExp, options?: Options)
    constructor(match: (line: string) => number, options?: Options)
    constructor(match: RegExp | ((line: string) => number), options?: Options) {
        if (match instanceof RegExp) {
            const regexp = match;
            match = (line: string) => {
                let result = regexp.exec(line);
                return result != null ? result[0].length : -1;
            }
        }
        this.match = match;
        this.value = options?.value ?? identity;
        this.mergeAdjacent = options?.mergeAdjacent ?? false;
        this.isWhitespace = options?.isWhitespace ?? false;
        this.discard = options?.discard ?? false;
        this.dent = options?.dent ?? false;
        this.newLine = options?.newLine ?? false;
    }

}

//  this is linear time now on types. We can make it much faster later.
export const TokenTypes = {
    //  Comment must come before Operator otherwise '//' interpreted as an operator
    Comment: new TokenType(/^\/\/.*/, { isWhitespace: true }),
    Dent: new TokenType(/^(    )/, {
        isWhitespace: true,
        dent: true,
        previousPredicate(token?: TokenType) {
            return token == null || token.dent || token.newLine;
        }
    }),
    Whitespace: new TokenType(/^[^\S\r\n]+/, { isWhitespace: true }),
    OpenParen: new TokenType(/^\(/),
    CloseParen: new TokenType(/^\)/),
    OpenBracket: new TokenType(/^\[/),
    CloseBracket: new TokenType(/^\]/),
    OpenBrace: new TokenType(/^\{/),
    CloseBrace: new TokenType(/^\}/),
    DoubleArrow: new TokenType(/^=>/),
    Number: new TokenType(/^[0-9]*\.[0-9]+(e[+-]?[0-9]+)?/, { value: JSON.parse }),
    Integer: new TokenType(/^([1-9][0-9]*|0x[0-9]+|0\b)/, { value: JSON.parse }),
    OutlineString: new TokenType(/^""/),
    String: new TokenType(/^"([^"\\]|\\.)*"/, { value: JSON.parse }),
    RegExp: new TokenType(/^\/([^/]|\\.)*\//, { value: eval }),
    // Operator has to come after Number/Integer so an adjacent - or + binds to literal.
    Operator: new TokenType(/^(\bvoid\b|\btypeof\b|\bis\b|[\=\+\-\*\&\^\%\!\~\/\.\:\;\?\,\<\>\|\&:]+)/i),
    //  Id has to come after Operator because of operator 'void'
    In: new TokenType(/^in\b/),
    If: new TokenType(/^if\b/),
    Null: new TokenType(/^null\b/),
    Else: new TokenType(/^else\b/),
    Return: new TokenType(/^return\b/),
    Class: new TokenType(/^class\b/),
    Struct: new TokenType(/^struct\b/),
    Extends: new TokenType(/^extends\b/),
    Implements: new TokenType(/^implements\b/),
    Function: new TokenType(/^function\b/),
    Var: new TokenType(/^var\b/),
    Let: new TokenType(/^let\b/),
    Const: new TokenType(/^const\b/),
    Type: new TokenType(/^type\b/),
    For: new TokenType(/^for\b/),
    Id: new TokenType(/^[_@a-z][_$@a-z0-9]*/i),
    EscapedId: new TokenType(/^`([^`\\]|\\.)*`/, { value: source => source.slice(1, -1) }),
    Eol: new TokenType(/^\r\n|\r|\n/, { isWhitespace: true, newLine: true }),
    Unknown: new TokenType(/^./, { mergeAdjacent: true }),
    //  anything after Unknown will never be matched against, they're manually inserted.
    Indent: new TokenType(/^[]/, { isWhitespace: true }),
    Outdent: new TokenType(/^[]/, { isWhitespace: true }),
} as const;

export type TokenName = keyof typeof TokenTypes;

export const TokenNames = Object.fromEntries(Object.keys(TokenTypes).map(name => [name, name])) as { [name in TokenName]: TokenName };