import { splitExpressions } from "../../ast/AstFunctions";
import { AstNode } from "../../ast/AstNode";
import { Expression } from "../../ast/Expression";
import { Token } from "../../ast/Token";
import { TokenName, TokenNames } from "../tokenizer/TokenTypes";
import { Parser } from "../Parser";
import { BinaryExpressionParselet } from "./BinaryExpressionParselet";
import { GroupParselet } from "./GroupParselet";
import { Reference } from "../../ast/Reference";
import { TypeExpression } from "../../ast/TypeExpression";
import { SemanticError } from "../../SemanticError";
import { VariableDeclaration } from "../../ast/VariableDeclaration";
import { MemberExpression } from "../../ast/MemberExpression";
import { SourceLocation } from "../../ast/SourceLocation";
import { DotExpression } from "../../ast/DotExpression";
import { Identifier } from "../../ast/Identifier";
import { ComparisonExpression } from "../../ast/ComparisonExpression";
import { TypeReference } from "../../ast/TypeReference";

export class InlineTypeExpressionParselet extends BinaryExpressionParselet {

    closeTokenType: TokenName;
    groupParselet = new GroupParselet(TokenNames.CloseBrace, true);

    constructor(closeToken: TokenName) {
        super();
        this.closeTokenType = closeToken;
    }

    parse(p: Parser, callee: Expression, open: Token): AstNode {
        let group = this.groupParselet.parse(p, open);
        let { value } = group;
        let args = splitExpressions(",", value);
        // callee, expect Reference, turn into TypeReference.
        if (!(callee instanceof Reference)) {
            throw new SemanticError(`Expected TypeReference`, callee);
        }
        let constraints: Expression[] = [];
        for (let arg of args) {
            if (arg instanceof VariableDeclaration) {
                if (arg.value) {
                    throw new SemanticError(`Default value not allowed on type expression`, arg.value);
                }
                if (!arg.type) {
                    throw new SemanticError(`Field constraint missing type`, arg);
                }
                //  convert left side to a dot expression
                const left = new MemberExpression(
                    arg.location,
                    new DotExpression(arg.id.location),
                    new Identifier(arg.id.location, arg.id.name)
                );
                const right = arg.type
                constraints.push(new ComparisonExpression(
                    arg.location, left, "is", right
                ));
            }
            // could also be a dot expression.
            else {
                constraints.push(arg);
            }
        }

        const result = new TypeExpression(
            SourceLocation.merge(callee.location, group.location),
            new TypeReference(callee.location, callee.name),
            constraints
        );
        return result;
    }

}