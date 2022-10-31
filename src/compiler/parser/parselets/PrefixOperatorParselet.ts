import { AstNode } from "../../ast/AstNode";
import { BinaryExpression } from "../../ast/BinaryExpression";
import { Token } from "../../ast/Token";
import { UnaryExpression } from "../../ast/UnaryExpression";
import { InfixOperators, PrefixOperator, PrefixOperators } from "../../Operators";
import { SemanticError } from "../../SemanticError";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";

export function getBinaryExpressionPrecedence(node: AstNode) {
    if (node instanceof BinaryExpression) {
        return InfixOperators[node.operator].precedence;
    }
}

export class PrefixOperatorParselet extends PrefixParselet {

    protected getPrecedence(token: Token) {
        return PrefixOperators[token.value as PrefixOperator].precedence;
    }

    protected parseArgument(p: Parser, token: Token, precedence = this.getPrecedence(token)): AstNode {
        if (precedence == null) {
            let { value, position } = token;
            throw new SemanticError(`Prefix operator not found: ${value}`, position);
        }
        let argument = p.parseExpression(precedence);
        return argument;
    }

    parse(p: Parser, operator: Token): AstNode {
        let { position} = operator;
        let value = operator.value as PrefixOperator;
        let argument = this.parseArgument(p, operator);

        let argumentBinaryExpressionPrecedence = getBinaryExpressionPrecedence(argument);
        let precedence = this.getPrecedence(operator);
        if (argumentBinaryExpressionPrecedence != null
            && precedence != null
            && argumentBinaryExpressionPrecedence > precedence
            && PrefixOperators[value].prefixAmbiguous
        ) {
            //  only exponentiation operator ** has higher precedence than unary operators
            //  we need a grouping construct because
            //  otherwise we don't know if -1 ** 2 is (-1) ** 2 or -(1 ** 2)
            let name = (argument as BinaryExpression).operator;
            throw new SemanticError(`Unary operator '${operator.value}' used before '${name}'. Use parentheses to disambiguate operator precedence.`, position);
        }

        return new UnaryExpression(
            position,
            operator.value as PrefixOperator,
            argument,
        );
    }

}