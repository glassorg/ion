import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { Token } from "../../ast/Token";
import { AstNode } from "../../ast/AstNode";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { SemanticError } from "../../SemanticError";
import { ConstantDeclaration } from "../../ast/ConstantDeclaration";
import { Reference } from "../../ast/Reference";
import { PositionFactory } from "../../PositionFactory";
import { Declarator } from "../../ast/Declarator";

export class ConstantParselet extends PrefixParselet {

    constructor(
        private Constructor: typeof ConstantDeclaration
    ) {
        super();
    }

    parse(p: Parser, constToken: Token): AstNode {
        p.whitespace();
        const assignment = p.parseExpression();
        if (!(assignment instanceof AssignmentExpression) || assignment.operator !== "=" || !(assignment.left instanceof Reference)) {
            throw new SemanticError(`Expected Identifier = Expression`, assignment)
        }
        return new this.Constructor(
            PositionFactory.merge(constToken.position, assignment.position),
            new Declarator(assignment.position, assignment.left.name),
            assignment.right
        );
    }

}