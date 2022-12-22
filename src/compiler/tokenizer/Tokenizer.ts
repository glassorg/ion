import { SourceLocation } from "../ast/SourceLocation";
import { Token } from "../ast/Token";
import { indentation } from "./indentation";
import { TokenType, TokenNames } from "./TokenTypes";

export class Tokenizer {

    constructor(
        private readonly types: { readonly [type: string]: TokenType }
    ) {
    }

    tokenize(filename: string, fileSource: string): Token[] {
        let tokens = new Array<Token>();
        let fileIndex = 0;
        let columnIndex = 0;
        let lineIndex = 0;
        let remainingSource = fileSource;
        while (remainingSource.length > 0) {
            for (let type of Object.keys(this.types)) {
                let tokenType = this.types[type];
                let matchLength = tokenType.match(remainingSource);
                if (matchLength > 0) {
                    const previousToken = tokens[tokens.length - 1];
                    const previousTokenType = this.types[previousToken?.type];
                    if (tokenType.previousPredicate && !tokenType.previousPredicate(previousTokenType)) {
                        continue;
                    }
                    let value = remainingSource.slice(0, matchLength);
                    let location = new SourceLocation(filename, fileIndex, lineIndex, columnIndex, fileIndex + matchLength, lineIndex, columnIndex + matchLength);
                    // if (type === "Id") {
                    //     console.log({ type, value, location });
                    // }
                    columnIndex += matchLength;
                    fileIndex += matchLength;

                    let lastToken = tokens[tokens.length - 1];
                    let newToken = new Token(location, type, value);
                    if (tokenType.mergeAdjacent && lastToken?.type === newToken.type) {
                        tokens[tokens.length - 1] = Token.merge(lastToken, newToken);
                    }
                    else {
                        tokens.push(newToken);
                        if (newToken.type === TokenNames.Eol) {
                            lineIndex++;
                            columnIndex = 0;
                        }
                    }
                    remainingSource = remainingSource.slice(matchLength);
                    break;
                }
            }
        }
        tokens = indentation(tokens);
        return tokens;
    }

}