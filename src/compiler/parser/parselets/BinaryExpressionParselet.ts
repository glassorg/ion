import { Parser } from "../Parser";
import { SemanticError } from "../../SemanticError";
import { Expression } from "../../ast/Expression";
import { InfixParselet } from "../InfixParslet";
import { Token } from "../../ast/Token";
import { InfixOperator, InfixOperators, isAssignmentOperator, isLogicalOperator, LogicalOperator } from "../../Operators";
import { BinaryExpression } from "../../ast/BinaryExpression";
import { AstNode } from "../../ast/AstNode";
import { PositionFactory } from "../../PositionFactory";
import { LogicalExpression } from "../../ast/LogicalExpression";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { MemberExpression } from "../../ast/MemberExpression";
import { Reference } from "../../ast/Reference";
import { Identifier } from "../../ast/Identifier";
import { VariableDeclaration } from "../../ast/VariableDeclaration";

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

    getClass(operator: string): typeof BinaryExpression {
        if (isLogicalOperator(operator)) {
            return LogicalExpression;
        }
        if (isAssignmentOperator(operator)) {
            return AssignmentExpression;
        }
        return BinaryExpression;
    }

    parse(p: Parser, left: Expression, operator: Token): AstNode {
        let right = this.parseRight(p, operator) as Expression;
        let position = PositionFactory.merge(left.position, right.position);
        if (isLogicalOperator(operator.value)) {
            return new LogicalExpression(position, left, operator.value, right);
        }
        if (isAssignmentOperator(operator.value)) {
            if (left instanceof VariableDeclaration) {
                if (operator.value !== "=") {
                    throw new SemanticError(`Expected =`, operator);
                }
                return left.patch({ value: right });
            }
            return new AssignmentExpression(position, left, operator.value, right);
        }
        if (operator.value === ":") {
            if (!(left instanceof Reference)) {
                throw new SemanticError(`Expected Identifier`, left);
            }
            return new VariableDeclaration(position, new Identifier(left.position, left.name), right, null);
        }
        if (operator.value === ".") {
            if (!(right instanceof Reference)) {
                throw new SemanticError(`Expected Identifier`, right);
            }
            return new MemberExpression(position, left, new Identifier(right.position, right.name));
        }
        return new BinaryExpression(position, left, operator.value as InfixOperator, right);
    }

    getPrecedence(token: Token) {
        return InfixOperators[token.value as InfixOperator]?.precedence ?? 0;
    }

}