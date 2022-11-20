import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { StringLiteral } from "../../ast/StringLiteral";
import { TokenNames } from "../../tokenizer/TokenTypes";
import { Token } from "../../ast/Token";
import { AstNode } from "../../ast/AstNode";

export class OutlineStringParselet extends PrefixParselet {

    parse(p: Parser, outlineString: Token): AstNode {
        let b = new Array<string>();
        let last = outlineString;
        if (p.eol() > 0) {
            let indent = p.peek(TokenNames.Indent);
            if (indent != null) {
                last = indent;
                let depth = 0;
                while (!p.done()) {
                    let next = p.consume();
                    switch (next.type) {
                        case TokenNames.Indent:
                            depth++;
                            break;
                        case TokenNames.Outdent:
                            depth--;
                            break;
                        default:
                            if (last.type === TokenNames.Eol) {
                                for (let i = 1; i < depth; i++) {
                                    b.push(indent.value);
                                }
                            }
                            b.push(next.value);
                            last = next;
                    }
                    if (depth === 0) {
                        break;
                    }
                }
            }
        }

        return new StringLiteral(
            outlineString.location.merge(last.location),
            b.join(""),
        )
    }

}