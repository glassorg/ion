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
        try {
            return this.factory(token);
        }
        catch (e) {
            debugger;
            const result = this.factory(token);
            throw e;
        }
    }

}