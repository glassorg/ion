import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { AstNode } from "../../ast/AstNode";
import { Token } from "../../ast/Token";

export class TerminalParselet extends PrefixParselet {

    constructor(
        public readonly factory: (token: Token) => AstNode,
    ) {
        super();
    }

    parse(p: Parser, token: Token) {
        return this.factory(token);
    }

}