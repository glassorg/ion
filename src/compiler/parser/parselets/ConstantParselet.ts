import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { Token } from "../../ast/Token";
import { AstNode } from "../../ast/AstNode";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { SemanticError } from "../../SemanticError";
import { ConstantDeclaration } from "../../ast/ConstantDeclaration";
import { Reference } from "../../ast/Reference";
import { Position, PositionFactory } from "../../PositionFactory";
import { Declarator } from "../../ast/Declarator";
import { Expression } from "../../ast/Expression";

export class ConstantParselet extends PrefixParselet {

    constructor(
        private factory: (position: Position, id: Declarator, value: Expression) => AstNode
    ) {
        super();
    }

    parse(p: Parser, constToken: Token): AstNode {
        p.whitespace();
        const assignment = p.parseNode();
        if (!(assignment instanceof AssignmentExpression) || assignment.operator !== "=" || !(assignment.left instanceof Reference)) {
            throw new SemanticError(`Expected Identifier = Expression`, assignment)
        }
        return this.factory(
            PositionFactory.merge(constToken.position, assignment.position),
            new Declarator(assignment.position, assignment.left.name),
            assignment.right
        );
    }

}