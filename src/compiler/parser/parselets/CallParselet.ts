import { AstNode } from "../../ast/AstNode";
import { Expression } from "../../ast/Expression";
import { PstCallExpression } from "../../ast/PstCallExpression";
import { Token } from "../../ast/Token";
import { PositionFactory } from "../../PositionFactory";
import { TokenName, TokenNames } from "../../tokenizer/TokenTypes";
import { Parser } from "../Parser";
import { BinaryExpressionParselet } from "./BinaryExpressionParselet";
import { GroupParselet } from "./GroupParselet";

export class CallParselet extends BinaryExpressionParselet {

    closeTokenType: TokenName;
    groupParselet = new GroupParselet(TokenNames.CloseParen, true);

    constructor(closeToken: TokenName) {
        super();
        this.closeTokenType = closeToken;
    }

    parse(p: Parser, callee: Expression, open: Token): AstNode {
        let group = this.groupParselet.parse(p, open);
        return new PstCallExpression(
            PositionFactory.merge(callee.position, group.position),
            callee,
            group.value,
        );
    }

}