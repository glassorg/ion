import { Identifier } from "../../ast/Identifier";
import { Declarator } from "../../ast/Declarator";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { Token } from "../../ast/Token";
import { SemanticError } from "../../SemanticError";
import { TokenNames } from "../../tokenizer/TokenTypes";
import { AstNode } from "../../ast/AstNode";
import { ClassDeclaration } from "../../ast/ClassDeclaration";
import { VariableDeclaration } from "../../ast/VariableDeclaration";
import { FieldDeclaration } from "../../ast/FieldDeclaration";
import { StructDeclaration } from "../../ast/StructDeclaration";

export class ClassParselet extends PrefixParselet {

    parse(p: Parser, classToken: Token): AstNode {
        let id = p.consume(TokenNames.Id);
        let block = p.maybeParseBlock();
        let location = classToken.location.merge(block?.location)
        let fields: FieldDeclaration[] = (block?.statements ?? []).map(s => {
            if (!(s instanceof VariableDeclaration)) {
                throw new SemanticError(`Expected class member declaration`, s);
            }
            return new FieldDeclaration(s.location, s.id, s.valueType, s.defaultValue);
        })
        return new (classToken.type === TokenNames.Class ? ClassDeclaration : StructDeclaration)(
            location,
            new Declarator(id.location, id.value),
            fields,
        );
    }

}