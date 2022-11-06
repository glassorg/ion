import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { IfStatement } from "../../ast/IfStatement";
import { Expression } from "../../ast/Expression";
import { TokenNames } from "../../tokenizer/TokenTypes";
import { PositionFactory } from "../../PositionFactory";
import { AstNode } from "../../ast/AstNode";
import { Token } from "../../ast/Token";

export class IfParselet extends PrefixParselet {

    parse(p: Parser, ifToken: Token): AstNode {
        let test = p.parseNode();
        let consequent = p.parseBlock();
        let alternate: AstNode | undefined;
        p.eol();
        let elseToken: Token | undefined;
        if (elseToken = p.maybeConsume(TokenNames.Else)) {
            p.whitespace();
            let elseIfToken = p.maybeConsume(TokenNames.If)
            if (elseIfToken) {
                p.whitespace();
                alternate = this.parse(p, elseIfToken);
            }
            else {
                alternate = p.parseBlock();
            }
        }
        return new IfStatement(
            PositionFactory.merge(ifToken.position, alternate?.position ?? test.position),
            test as Expression,
            consequent,
            alternate as Expression,
        );
    }

}