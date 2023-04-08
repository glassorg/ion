import { Parser } from "../Parser";
import { BinaryExpressionParselet } from "./BinaryExpressionParselet";
import { Expression } from "../../ast/Expression";
import { AstNode } from "../../ast/AstNode";
import { Token } from "../../ast/Token";
import { TokenName } from "../tokenizer/TokenTypes";
import { SemanticError } from "../../SemanticError";
import { TypeReference } from "../../ast/TypeReference";
import { SourceLocation } from "../../ast/SourceLocation";
import { CoreTypes } from "../../common/CoreType";
import { Reference } from "../../ast/Reference";
import { IndexExpression } from "../../ast/IndexExpression";

export class MemberParselet extends BinaryExpressionParselet {

    closeTokenType: TokenName;

    constructor(closeTokenType: TokenName) {
        super();
        this.closeTokenType = closeTokenType;
    }

    parse(p: Parser, object: Expression, openToken: Token): AstNode {
        p.whitespace();
        let closeToken: Token | undefined;
        if (closeToken = p.maybeConsume(this.closeTokenType)) {
            //  if the member is empty then this is an Array TypeReference.
            if (!(object instanceof Reference)) {
                throw new SemanticError(`Expected Reference`, object);
            }
            return new TypeReference(
                SourceLocation.merge(object.location, closeToken.location),
                CoreTypes.Array,
                [new TypeReference(
                    SourceLocation.merge(openToken.location, closeToken.location),
                    object.name,
                )]
            );
        }
        let property = p.parseExpression(0);
        let close = p.consume(this.closeTokenType);
        return new IndexExpression(
            object.location.merge(close.location),
            object,
            property,
        );
    }

}