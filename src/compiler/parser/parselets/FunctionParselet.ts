import { AstNode } from "../../ast/AstNode";
import { Declarator } from "../../ast/Declarator";
import { Token } from "../../ast/Token";
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
            // TODO: Check for var which shouldn't be there.
            // let varTokenPosition = p.getVarTokenPosition();
            // if (varTokenPosition){
            //     throw new SemanticError(`var token not allowed`, varTokenPosition);
            // }
            return new ParameterDeclaration(p.location, p.id, p.valueType, p.defaultValue)
        });
        p.consume(TokenNames.CloseParen);
        p.whitespace();
        p.consume(TokenNames.DoubleArrow);
        p.whitespace();
        let block = p.maybeParseBlock();
        if (block == null) {
            let value = p.parseInlineExpression();
            block = new BlockStatement(value.location, [
                new ReturnStatement(value.location, value)
            ]);
        }
        let location = functionToken.location.merge(block.location);
        return new FunctionDeclaration(
            location,
            new Declarator(id.location, id.value),
            new FunctionExpression(location, parameters, block)
        )
    }

}