import { AstNode } from "../../ast/AstNode";
import { PstForLoop } from "../../ast/ForStatement";
import { Token } from "../../ast/Token";
import { PositionFactory } from "../../PositionFactory";
import { TokenNames } from "../../tokenizer/TokenTypes";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";

export class ForParselet extends PrefixParselet {

    parse(p: Parser, forToken: Token): AstNode {
        let id = p.parseExpression();
        p.whitespace();
        p.consume(TokenNames.In);
        p.whitespace();
        let value = p.parseInlineExpression();
        p.whitespace();
        let body = p.parseBlock();
        return new PstForLoop(
            PositionFactory.merge(forToken.position, value.position),
            id,
            value,
            body,
        );
    }

}