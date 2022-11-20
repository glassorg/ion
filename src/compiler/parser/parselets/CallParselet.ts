import { AstNode } from "../../ast/AstNode";
import { CallExpression } from "../../ast/CallExpression";
import { Expression } from "../../ast/Expression";
import { Token } from "../../ast/Token";
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
        let { value } = group;
        let args = value?.split(`,`) ?? [];

        return new CallExpression(
            callee.location.merge(group.location),
            callee,
            args
        );
    }

}