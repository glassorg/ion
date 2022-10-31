import { AstNode } from "../../ast/AstNode";
import { Token } from "../../ast/Token";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";

export class BlockParselet extends PrefixParselet {

    parse(p: Parser, indentToken: Token): AstNode {
        return p.parseBlock(indentToken);
    }

}