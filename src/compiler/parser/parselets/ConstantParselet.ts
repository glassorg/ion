import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { Token } from "../../ast/Token";
import { AstNode } from "../../ast/AstNode";
import { AssignmentExpression } from "../../ast/AssignmentExpression";
import { SemanticError } from "../../SemanticError";
import { Reference } from "../../ast/Reference";
import { Declarator } from "../../ast/Declarator";
import { Expression } from "../../ast/Expression";
import { SourceLocation } from "../../ast/SourceLocation";

export class ConstantParselet extends PrefixParselet {

    constructor(
        private factory: (location: SourceLocation, id: Declarator, value: Expression) => AstNode
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
            constToken.location.merge(assignment.location),
            assignment.left.toDeclarator(),
            assignment.right
        );
    }

}