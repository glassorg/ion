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
// import { NullLiteral } from "../ast/NullLiteral";
// import { RegExpLiteral } from "../ast/RegExpLiteral";

export function createParser(positionFactory?: PositionFactory) {
    return new Parser({
        Number: new TerminalParselet(token => new FloatLiteral(token.position, JSON.parse(token.value))),
        Integer: new TerminalParselet(token => new IntegerLiteral(token.position, JSON.parse(token.value))),
        String: new TerminalParselet(token => new StringLiteral(token.position, JSON.parse(token.value))),
        // RegExp: new TerminalParselet(RegExpLiteral, "value"),
        // Null: new TerminalParselet(NullLiteral, "value"),
        Operator: new PrefixOperatorParselet(),
        Id: new TerminalParselet(token => new Reference(token.position, token.value)),
        EscapedId: new TerminalParselet(token => new Reference(token.position, token.value.slice(1, -1))),
        If: new IfParselet(),
        For: new ForParselet(),
        Var: new VariableParselet(),
        Const: new ConstantParselet(ConstantDeclaration),
        Type: new ConstantParselet(TypeDeclaration),
        // Class: new ClassParselet(),
        Return: new ReturnParselet(),
        OpenParen: new GroupParselet(TokenNames.CloseParen, true),
        OpenBracket: new GroupParselet(TokenNames.CloseBracket, true),
        OpenBrace: new GroupParselet(TokenNames.CloseBrace, true),
        Indent: new BlockParselet(),
        OutlineString: new OutlineStringParselet(),
    },
    {
        Operator: new BinaryExpressionParselet(),
        OpenParen: new CallParselet(TokenNames.CloseParen),
        OpenBracket: new MemberParselet(TokenNames.CloseBracket),
    }, positionFactory)
}