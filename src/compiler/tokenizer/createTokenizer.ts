import { Tokenizer } from "./Tokenizer";
import { TokenTypes } from "./TokenTypes";

export function createTokenizer() {
    return new Tokenizer(TokenTypes);
}