import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { Token } from "../../ast/Token";
import { SemanticError } from "../../SemanticError";
import { AstNode } from "../../ast/AstNode";
import { VariableDeclaration } from "../../ast/VariableDeclaration";

export class VariableParselet extends PrefixParselet {

    parse(p: Parser, varToken: Token): AstNode {
        p.whitespace();
        let variable = p.parseNode();
        if (!(variable instanceof VariableDeclaration)) {
            throw new SemanticError(`Expected Identifier : Type = Expression`, variable);
        }
        let location = varToken.location.merge(variable.location );
        return variable.patch({ location });
    }

}