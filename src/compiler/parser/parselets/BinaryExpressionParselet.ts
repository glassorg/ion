import { Parser } from "../Parser";
import { SemanticError } from "../../SemanticError";
import { Expression } from "../../ast/Expression";
import { InfixParselet } from "../InfixParslet";
import { Token } from "../../ast/Token";
import { InfixOperator, InfixOperators, isAssignmentOperator } from "../../Operators";
import { AstNode } from "../../ast/AstNode";
import { MemberExpression } from "../../ast/MemberExpression";
import { Reference } from "../../ast/Reference";
import { Identifier } from "../../ast/Identifier";
import { VariableDeclaration, VariableKind } from "../../ast/VariableDeclaration";
import { createBinaryExpression } from "../../ast/AstFunctions";
import { RangeExpression } from "../../ast/RangeExpression";
import { FunctionExpression } from "../../ast/FunctionExpression";
import { PstGroup } from "../../ast/PstGroup";
import { toType } from "../../ast/Type";
import { Declarator } from "../../ast/Declarator";

export class BinaryExpressionParselet extends InfixParselet {

    protected parseRight(p: Parser, token: Token, allowBlock = InfixOperators[token.value as InfixOperator].allowOutline): AstNode {
        let { value, location } = token;
        let precedence = this.getPrecedence(token);
        if (precedence == null) {
            throw new SemanticError(`Infix operator not found: ${value}`, location);
        }
        let rightAssociative = InfixOperators[value as InfixOperator]?.rightAssociative;
        let right = allowBlock && p.maybeParseBlock() || p.parseNode(precedence + (rightAssociative ? -1 : 0));
        return right;
    }

    parse(p: Parser, left: Expression, operatorToken: Token): AstNode {
        let right = this.parseRight(p, operatorToken) as Expression;
        let location = left.location.merge(right.location);
        let operator = operatorToken.value as InfixOperator;
        if (operator === ":" || operator === "::") {
            let type = toType(right);
            if (left instanceof PstGroup) {
                // this is used sometimes to create a function declaration
                return left.patch({ type, exactType: operator === "::" });
            }
            if (!(left instanceof Reference)) {
                throw new SemanticError(`Expected Identifier`, left);
            }
            return new VariableDeclaration(location, left.toDeclarator(), { type });
        }
        if (operator === ".") {
            if (!(right instanceof Reference)) {
                throw new SemanticError(`Expected Identifier`, right);
            }
            return new MemberExpression(location, left, new Identifier(right.location, right.name));
        }
        if (operator === ":=") {
            if (!(left instanceof Reference)) {
                throw new SemanticError(`Expected Identifier`, left);
            }
            if (!(right instanceof Expression)) {
                throw new SemanticError(`Expected Expression`, right);
            }
            return new VariableDeclaration(location, new Declarator(left.location, left.name), {
                kind: VariableKind.Var,
                value: right
            });
        }
        if (operator.indexOf("..") >= 0) {
            let minExclusive = operator.startsWith("<");
            let maxExclusive = operator.endsWith("<");
            return new RangeExpression(location, left, right, minExclusive, maxExclusive);
        }
        if (operator === "->") {
            return FunctionExpression.createFromLambda(left, right);
        }
        if (isAssignmentOperator(operator)) {
            if (left instanceof VariableDeclaration) {
                if (operator !== "=") {
                    throw new SemanticError(`Expected =`, operatorToken);
                }
                return left.patch({ location, defaultValue: right });
            }
        }
        if (operator === "{") {
            throw new SemanticError("Handle inline type constraint block?", left);
            // how will we handle an inline type constraint block?
        }
        return createBinaryExpression(location, left, operator, right, operatorToken.location);
    }

    getPrecedence(token: Token) {
        return InfixOperators[token.value as InfixOperator]?.precedence ?? 0;
    }

}