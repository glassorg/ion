import { Token } from "../ast/Token";
import { InfixOperators, isInfixOperator } from "../Operators";
import { TokenNames } from "./TokenTypes";

function splitIntoLines(tokens: Token[]): Token[][] {
    let lines = new Array<Array<Token>>();
    let line = new Array<Token>();
    for (let token of tokens) {
        line.push(token);
        if (token.type === TokenNames.Eol) {
            lines.push(line);
            line = [];
        }
    }
    if (line.length > 0) {
        lines.push(line);
    }
    return lines;
}

function isDent(token?: Token) {
    return token != null && token.type === TokenNames.Dent;
}

function calculateDentation(lines: Token[][]): Token[] {
    let depth = 0;
    let tokens = new Array<Token>();
    for (let line of lines) {
        let dents = 0;
        //  consume all available dents
        for (let token of line) {
            if (isDent(token)) {
                dents++;
            }
            else {
                break;
            }
        }
        if (dents > depth) {
            // insert Indents
            for (let i = 0; i < (dents - depth); i++) {
                let dent = line[depth + i];
                tokens.push(dent.patch({ type: TokenNames.Indent }));
            }
        }
        else if (dents < depth) {
            //  insert Outdents
            for (let i = 0; i < (depth - dents); i++) {
                let dent = line[dents];
                tokens.push(new Token(
                    dent.position,
                    TokenNames.Outdent,
                    "",
                ));
            }
        }
        depth = dents;
        tokens.push(...line.slice(dents));
    }
    if (depth > 0) {
        // add final Outdents
        let last = tokens[tokens.length - 1];
        for (let i = 0; i < depth; i++) {
            tokens.push(new Token(
                last.position,
                TokenNames.Outdent,
                "",
            ));
        }
    }
    return tokens;
}

/**
 * Swaps Outdent's to occur before EOL's.
 * This fixes a problem of parentheses following an outdent peer being interpreted as a call.
 */
function pushOutdentsToBeforeEOLs(tokens: Token[]): void {
    for (let i = 0; i < tokens.length - 1; i++) {
        let a = tokens[i + 0];
        let b = tokens[i + 1];
        if (a.type === TokenNames.Eol && b.type === TokenNames.Outdent) {
            tokens[i + 0] = b;
            tokens[i + 1] = a;
        }
    }
}

function removeEOLsBeforeOutlineInfixOperators(tokens: Token[]): void {
    for (let i = tokens.length - 2; i >= 0; i--) {
        let a = tokens[i + 0];
        let b = tokens[i + 1];
        if (a.type === TokenNames.Eol && isInfixOperator(b.value) && InfixOperators[b.value].allowOutline) {
            tokens.splice(i, 1);
        }
    }
}

/**
 * Inserts Indent and Dedent tokens and removes tabs.
 */
export function indentation(tokens: Token[]) {
    let lines = splitIntoLines(tokens);
    tokens = calculateDentation(lines);
    pushOutdentsToBeforeEOLs(tokens);
    removeEOLsBeforeOutlineInfixOperators(tokens);
    return tokens;
}