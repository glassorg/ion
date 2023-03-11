import { Parser } from "../Parser";
import { BinaryExpressionParselet } from "./BinaryExpressionParselet";
import { Expression } from "../../ast/Expression";
import { AstNode } from "../../ast/AstNode";
import { Token } from "../../ast/Token";
import { TokenName } from "../tokenizer/TokenTypes";
import { IndexExpression } from "../../ast/IndexExpression";

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
        return new IndexExpression(
            object.location.merge(close.location),
            object,
            property,
        );
    }

}