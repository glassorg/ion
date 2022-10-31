import { Parser } from "../Parser";
import { SemanticError } from "../../SemanticError";
import { Expression } from "../../ast/Expression";
import { InfixParselet } from "../InfixParslet";
import { Token } from "../../ast/Token";
import { InfixOperator, InfixOperators } from "../../Operators";
import { BinaryExpression } from "../../ast/BinaryExpression";
import { AstNode } from "../../ast/AstNode";
import { PositionFactory } from "../../PositionFactory";

export class BinaryExpressionParselet extends InfixParselet {

    protected parseRight(p: Parser, token: Token, allowBlock = true): AstNode {
        let { value, position } = token;
        let precedence = this.getPrecedence(token);
        if (precedence == null) {
            throw new SemanticError(`Infix operator not found: ${value}`, position);
        }
        let rightAssociative = InfixOperators[value as InfixOperator]?.rightAssociative;
        let right = allowBlock && p.maybeParseBlock() || p.parseExpression(precedence + (rightAssociative ? -1 : 0));
        return right;
    }

    parse(p: Parser, left: AstNode, operator: Token): AstNode {
        let right = this.parseRight(p, operator);
        
        return new BinaryExpression(
            PositionFactory.merge(left.position, right.position),
            left as Expression,
            operator.value as InfixOperator,
            right as Expression,
        );
    }

    getPrecedence(token: Token) {
        return InfixOperators[token.value as InfixOperator]?.precedence ?? 0;
    }

}