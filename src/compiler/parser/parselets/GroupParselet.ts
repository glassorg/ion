import { Expression } from "../../ast/Expression";
import { PstGroup } from "../../ast/PstGroup";
import { Token } from "../../ast/Token";
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
        let last = close.location;
        return new PstGroup(
            open.location.merge(last),
            open,
            close,
            value,
        )
    }

}