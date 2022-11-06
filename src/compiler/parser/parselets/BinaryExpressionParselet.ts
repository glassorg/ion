import { Parser } from "../Parser";
import { SemanticError } from "../../SemanticError";
import { Expression } from "../../ast/Expression";
import { InfixParselet } from "../InfixParslet";
import { Token } from "../../ast/Token";
import { AssignmentOperator, InfixOperator, InfixOperators, isAssignmentOperator, isLogicalOperator, LogicalOperator } from "../../Operators";
import { BinaryExpression } from "../../ast/BinaryExpression";
import { AstNode } from "../../ast/AstNode";
import { PositionFactory } from "../../PositionFactory";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { MemberExpression } from "../../ast/MemberExpression";
import { Reference } from "../../ast/Reference";
import { Identifier } from "../../ast/Identifier";
import { VariableDeclaration } from "../../ast/VariableDeclaration";
import { Declarator } from "../../ast/Declarator";
import { TokenNames } from "../../tokenizer/TokenTypes";

export class BinaryExpressionParselet extends InfixParselet {

    protected parseRight(p: Parser, token: Token, allowBlock = true): AstNode {
        let { value, position } = token;
        let precedence = this.getPrecedence(token);
        if (precedence == null) {
            throw new SemanticError(`Infix operator not found: ${value}`, position);
        }
        let rightAssociative = InfixOperators[value as InfixOperator]?.rightAssociative;
        let right = allowBlock && p.maybeParseBlock() || p.parseNode(precedence + (rightAssociative ? -1 : 0));
        return right;
    }

    parse(p: Parser, left: Expression, operatorToken: Token): AstNode {
        let right = this.parseRight(p, operatorToken) as Expression;
        let position = PositionFactory.merge(left.position, right.position);
        let operator = operatorToken.value as InfixOperator;
        if (isAssignmentOperator(operator)) {
            if (left instanceof VariableDeclaration) {
                if (operator !== "=") {
                    throw new SemanticError(`Expected =`, operatorToken);
                }
                return left.patch({ defaultValue: right });
            }
            if (operator !== "=") {
                right = new BinaryExpression(position, left, operator.slice(0, -1) as InfixOperator, right);
            }
            return new AssignmentExpression(position, left, right);
        }
        if (operator === ":") {
            if (!(left instanceof Reference)) {
                throw new SemanticError(`Expected Identifier`, left);
            }
            return new VariableDeclaration(position, new Declarator(left.position, left.name), right, null);
        }
        if (operator === ".") {
            if (!(right instanceof Reference)) {
                throw new SemanticError(`Expected Identifier`, right);
            }
            return new MemberExpression(position, left, new Identifier(right.position, right.name));
        }
        return new BinaryExpression(position, left, operator, right);
    }

    getPrecedence(token: Token) {
        return InfixOperators[token.value as InfixOperator]?.precedence ?? 0;
    }

}