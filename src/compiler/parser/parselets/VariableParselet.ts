import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { Token } from "../../ast/Token";
import { SemanticError } from "../../SemanticError";
import { AstNode } from "../../ast/AstNode";
import { VariableDeclaration } from "../../ast/VariableDeclaration";
import { PositionFactory } from "../../PositionFactory";

export class VariableParselet extends PrefixParselet {

    parse(p: Parser, varToken: Token): AstNode {
        p.whitespace();
        let variable = p.parseExpression();
        if (!(variable instanceof VariableDeclaration)) {
            throw new SemanticError(`Expected Identifier : Type = Expression`, variable)
        }
        return variable.patch({ position: PositionFactory.merge(varToken.position, variable.position )});
    }

}