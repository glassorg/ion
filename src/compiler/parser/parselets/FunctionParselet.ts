import { AstNode } from "../../ast/AstNode";
import { Declarator } from "../../ast/Declarator";
import { Token } from "../../ast/Token";
import { TokenNames } from "../../tokenizer/TokenTypes";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { FunctionDeclaration } from "../../ast/FunctionDeclaration";
import { SemanticError } from "../../SemanticError";
import { FunctionExpression } from "../../ast/FunctionExpression";
import { ExpressionStatement } from "../../ast/ExpressionStatement";

export class FunctionParselet extends PrefixParselet {

    parse(p: Parser, functionToken: Token): AstNode {
        let id = p.consumeOne(TokenNames.Id, TokenNames.EscapedId);
        if (id.type === TokenNames.EscapedId) {
            // hack to fix escaped id
            id = id.patch({ value: id.value.slice(1, -1) });
        }
        p.whitespace();
        const maybeMultiFunctionBlock = p.maybeParseBlock();
        let values = (maybeMultiFunctionBlock?.statements
            ?? [p.parseExpression()]).map(value => {
                if (value instanceof ExpressionStatement) {
                    value = value.expression;
                }
                if (!(value instanceof FunctionExpression)) {
                    throw new SemanticError(`Expected FunctionExpression`, value);
                }
                return value;
            });
        
        // might be a multi function?
        let location = functionToken.location.merge(values[values.length - 1].location);
        return new FunctionDeclaration(location, new Declarator(id.location, id.value), ...values);
    }

}