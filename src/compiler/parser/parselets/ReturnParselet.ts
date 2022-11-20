import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { Token } from "../../ast/Token";
import { AstNode } from "../../ast/AstNode";
import { ReturnStatement } from "../../ast/ReturnStatement";

export class ReturnParselet extends PrefixParselet {

    parse(p: Parser, returnToken: Token): AstNode {
        let value = p.parseExpression();
        return new ReturnStatement(
            returnToken.location.merge(value.location),
            value,
        );
    }

}