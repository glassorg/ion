import { Expression } from "../../ast/Expression";
import { PstGroup } from "../../ast/PstGroup";
import { SequenceExpression } from "../../ast/SequenceExpression";
import { Token } from "../../ast/Token";
import { PositionFactory } from "../../PositionFactory";
import { TokenName } from "../../tokenizer/TokenTypes";
import { Parser } from "../Parser";
import { PrefixOperatorParselet } from "./PrefixOperatorParselet";


export class GroupParselet extends PrefixOperatorParselet {

    closeToken: TokenName;
    canBeEmpty: boolean;

    constructor(close: TokenName, canBeEmpty: boolean) {
        super();
        this.closeToken = close;
        this.canBeEmpty = canBeEmpty;
    }

    parse(p: Parser, open: Token): PstGroup {
        let value: Expression | undefined;
        if (!this.canBeEmpty || p.peek(this.closeToken) == null) {
            value = this.parseArgument(p, open, 0) as Expression;
        }
        let close = p.consume(this.closeToken);
        let last = close.position;
        // now let's see if we can consume an indented child block
        let outlineBlock = p.maybeParseBlock();
        if (outlineBlock != null) {
            value = SequenceExpression.merge(value, ...outlineBlock.statements);
            last = outlineBlock.position;
        }
        return new PstGroup(
            PositionFactory.merge(open.position, last),
            open,
            close,
            value,
        )
    }

}