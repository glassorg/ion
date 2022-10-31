import { Parser } from "../Parser";
import { InfixParselet } from "../InfixParslet";
import { SemanticError } from "../../SemanticError";
import { AstNode } from "../../ast/AstNode";
import { Token } from "../../ast/Token";

export class RoutingInfixParselet extends InfixParselet {

    valueParselets: { [value: string]: InfixParselet | undefined };
    defaultParselet?: InfixParselet;

    constructor(
        valueParselets: { [value: string]: InfixParselet | undefined },
        defaultParselet?: InfixParselet,
    ) {
        super();
        this.valueParselets = valueParselets;
        this.defaultParselet = defaultParselet;
    }

    private getParselet(token: Token) {
        let { value } = token;
        let parselet = this.valueParselets[value] ?? this.defaultParselet;
        if (parselet == null) {
            throw new SemanticError(`Unexpected token: ${value}`, token.position);
        }
        return parselet;
    }

    parse(p: Parser, left: AstNode, token: Token): AstNode {
        let parselet = this.getParselet(token);
        return parselet.parse(p, left, token);
    }

    getPrecedence(token: Token) {
        let parselet = this.getParselet(token);
        return parselet.getPrecedence(token);
    }

}