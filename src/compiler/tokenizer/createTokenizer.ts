import { PositionFactory } from "../PositionFactory";
import { Tokenizer } from "./Tokenizer";
import { TokenTypes } from "./TokenTypes";

export function createTokenizer(positionFactory: PositionFactory = new PositionFactory()) {
    return new Tokenizer(TokenTypes, positionFactory);
}