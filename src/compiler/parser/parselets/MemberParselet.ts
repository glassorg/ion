import { Parser } from "../Parser";
import { BinaryExpressionParselet } from "./BinaryExpressionParselet";
import { MemberExpression } from "../../ast/MemberExpression";
import { Expression } from "../../ast/Expression";
import { AstNode } from "../../ast/AstNode";
import { Token } from "../../ast/Token";
import { TokenName } from "../../tokenizer/TokenTypes";
import { PositionFactory } from "../../PositionFactory";

export class MemberParselet extends BinaryExpressionParselet {

    closeTokenType: TokenName;

    constructor(closeTokenType: TokenName) {
        super();
        this.closeTokenType = closeTokenType;
    }

    parse(p: Parser, object: Expression, open: Token): AstNode {
        p.whitespace();
        let property = p.parseExpression(0);
        let close = p.consume(this.closeTokenType);
        return new MemberExpression(
            PositionFactory.merge(object.position, close.position),
            object,
            property as Expression,
            true
        );
    }

}