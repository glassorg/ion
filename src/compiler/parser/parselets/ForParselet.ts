import { AstNode } from "../../ast/AstNode";
import { Declarator } from "../../ast/Declarator";
import { ForStatement } from "../../ast/ForStatement";
import { Reference } from "../../ast/Reference";
import { Token } from "../../ast/Token";
import { SemanticError } from "../../SemanticError";
import { TokenNames } from "../../tokenizer/TokenTypes";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";

export class ForParselet extends PrefixParselet {

    parse(p: Parser, forToken: Token): AstNode {
        let id = p.parseNode();
        if (!(id instanceof Reference)) {
            throw new SemanticError(`Expected identifier`, id)
        }
        p.whitespace();
        p.consume(TokenNames.In);
        p.whitespace();
        let value = p.parseInlineExpression();
        p.whitespace();
        let body = p.parseBlock();
        return new ForStatement(
            forToken.location.merge(value.location),
            new Declarator(id.location, id.name),
            value,
            body,
        );
    }

}