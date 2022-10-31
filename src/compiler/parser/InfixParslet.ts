import { Parser } from "./Parser";
import { Token } from "../ast/Token";
import { AstNode } from "../ast/AstNode";

export abstract class InfixParselet {

    abstract parse(p: Parser, left: AstNode, token: Token): AstNode;
    abstract getPrecedence(token: Token): number | undefined;

}