import { Parser } from "./Parser";
import { PrefixOperatorParselet } from "./parselets/PrefixOperatorParselet";
import { StringLiteral } from "../ast/StringLiteral";
import { BinaryExpressionParselet } from "./parselets/BinaryExpressionParselet";
import { MemberParselet } from "./parselets/MemberParselet";
import { TerminalParselet } from "./parselets/TerminalParselet";
import { Reference } from "../ast/Reference";
import { GroupParselet } from "./parselets/GroupParselet";
import { CallParselet } from "./parselets/CallParselet";
import { IfParselet } from "./parselets/IfParselet";
import { ReturnParselet } from "./parselets/ReturnParselet";
// import { ClassParselet } from "./parselets/ClassParselet";
import { ForParselet } from "./parselets/ForParselet";
import { BlockParselet } from "./parselets/BlockParselet";
import { OutlineStringParselet } from "./parselets/OutlineStringParselet";
import { FloatLiteral } from "../ast/FloatLiteral";
import { IntegerLiteral } from "../ast/IntegerLiteral";
import { TokenNames } from "../tokenizer/TokenTypes";
import { PositionFactory } from "../PositionFactory";
import { VariableParselet } from "./parselets/VariableParselet";
import { ConstantParselet } from "./parselets/ConstantParselet";
import { ConstantDeclaration } from "../ast/ConstantDeclaration";
import { TypeDeclaration } from "../ast/TypeDeclaration";
import { FunctionParselet } from "./parselets/FunctionParselet";
import { ReservedWordParselet } from "./parselets/ReservedWordParselet";
import { ClassParselet } from "./parselets/ClassParselet";

export function createParser(positionFactory?: PositionFactory) {
    return new Parser({
        Number: new TerminalParselet(token => new FloatLiteral(token.position, JSON.parse(token.value))),
        Integer: new TerminalParselet(token => new IntegerLiteral(token.position, JSON.parse(token.value))),
        String: new TerminalParselet(token => new StringLiteral(token.position, JSON.parse(token.value))),
        Operator: new PrefixOperatorParselet(),
        Id: new TerminalParselet(token => new Reference(token.position, token.value)),
        EscapedId: new TerminalParselet(token => new Reference(token.position, token.value.slice(1, -1))),
        If: new IfParselet(),
        For: new ForParselet(),
        Var: new VariableParselet(),
        Extends: new ReservedWordParselet(),
        Implements: new ReservedWordParselet(),
        Function: new FunctionParselet(),
        Const: new ConstantParselet((position, id, value) => new ConstantDeclaration(position, id, value)),
        Type: new ConstantParselet((position, id, value) => new TypeDeclaration(position, id, value)),
        Return: new ReturnParselet(),
        OpenParen: new GroupParselet(TokenNames.CloseParen, true),
        OpenBracket: new GroupParselet(TokenNames.CloseBracket, true),
        OpenBrace: new GroupParselet(TokenNames.CloseBrace, true),
        Class: new ClassParselet(),
        Struct: new ClassParselet(),
        Indent: new BlockParselet(),
        OutlineString: new OutlineStringParselet(),
    },
    {
        Operator: new BinaryExpressionParselet(),
        OpenParen: new CallParselet(TokenNames.CloseParen),
        OpenBracket: new MemberParselet(TokenNames.CloseBracket),
    }, positionFactory)
}