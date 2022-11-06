import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { AstNode } from "../../ast/AstNode";
import { Token } from "../../ast/Token";
import { SemanticError } from "../../SemanticError";

export class ReservedWordParselet extends PrefixParselet {

    parse(p: Parser, token: Token): AstNode {
        throw new SemanticError(`"${token.value}" is a reserved word`);
    }

}