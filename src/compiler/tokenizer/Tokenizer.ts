import { Token } from "../ast/Token";
import { PositionFactory } from "../PositionFactory";
import { indentation } from "./indentation";
import { TokenType, TokenNames } from "./TokenTypes";

export class Tokenizer {

    constructor(
        private readonly types: { readonly [type: string]: TokenType },
        private readonly positionFactory: PositionFactory
    ) {
    }

    tokenize(filename: string, fileSource: string): Token[] {
        let tokens = new Array<Token>();
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
                    let position = this.positionFactory.create(filename, lineIndex, columnIndex, matchLength);
                    columnIndex += matchLength;

                    let lastToken = tokens[tokens.length - 1];
                    let newToken = new Token(type, value, position);
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