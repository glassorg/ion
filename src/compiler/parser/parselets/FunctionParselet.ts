import { AstNode } from "../../ast/AstNode";
import { Declarator } from "../../ast/Declarator";
import { Token } from "../../ast/Token";
import { PositionFactory } from "../../PositionFactory";
import { TokenNames } from "../../tokenizer/TokenTypes";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { BlockStatement } from "../../ast/BlockStatement";
import { ReturnStatement } from "../../ast/ReturnStatement";
import { FunctionDeclaration } from "../../ast/FunctionDeclaration";
import { VariableDeclaration } from "../../ast/VariableDeclaration";
import { SemanticError } from "../../SemanticError";
import { ParameterDeclaration } from "../../ast/ParameterDeclaration";
import { FunctionExpression } from "../../ast/FunctionExpression";

export class FunctionParselet extends PrefixParselet {

    parse(p: Parser, functionToken: Token): AstNode {
        let id = p.consume(TokenNames.Id);
        p.whitespace();
        p.consume(TokenNames.OpenParen);
        let parameters = p.parseInlineExpression().split(",").map(p => {
            if (!(p instanceof VariableDeclaration)) {
                throw new SemanticError(`Expected parameter declaration`, p);
            }
            let varTokenPosition = p.getVarTokenPosition();
            if (varTokenPosition){
                throw new SemanticError(`var token not allowed`, varTokenPosition);
            }
            return new ParameterDeclaration(p.position, p.id, p.valueType, p.defaultValue)
        });
        p.consume(TokenNames.CloseParen);
        p.whitespace();
        p.consume(TokenNames.DoubleArrow);
        p.whitespace();
        let block = p.maybeParseBlock();
        if (block == null) {
            let value = p.parseInlineExpression();
            block = new BlockStatement(value.position, [
                new ReturnStatement(value.position, value)
            ]);
        }
        let position = PositionFactory.merge(functionToken.position, block.position);
        return new FunctionDeclaration(
            position,
            new Declarator(id.position, id.value),
            new FunctionExpression(position, parameters, block)
        )
    }

}