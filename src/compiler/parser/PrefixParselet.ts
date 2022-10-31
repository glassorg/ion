import { Parser } from "./Parser";
import { AstNode } from "../ast/AstNode";
import { Token } from "../ast/Token";

export abstract class PrefixParselet {

    abstract parse(p: Parser, token: Token): AstNode

}