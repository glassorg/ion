// import { Identifier } from "../../ast/Identifier";
// import { Declarator } from "../../ast/Declarator";
// import { Parser } from "../Parser";
// import { PrefixParselet } from "../PrefixParselet";
// import { Token } from "../../ast/Token";
// import { SemanticError } from "../../SemanticError";
// import { TokenNames } from "../../tokenizer/TokenTypes";
// import { PositionFactory } from "../../PositionFactory";
// import { AstNode } from "../../ast/AstNode";
// import { ClassDeclaration } from "../../ast/ClassDeclaration";
// import { Declaration } from "../../ast/Declaration";

// export class ClassParselet extends PrefixParselet {

//     parse(p: Parser, classToken: Token): AstNode {
//         let id = p.parseExpression();
//         if (!(id instanceof Identifier)) {
//             throw new SemanticError(`Expected identifier`, id);
//         }
//         let _extends: AstNode | null = null;
//         let extendsToken: Token | undefined;
//         if (extendsToken = p.maybeConsume(TokenNames.Extends)) {
//             p.whitespace();
//             _extends = p.parseExpression();
//         }
//         let block = p.maybeParseBlock();
//         let position = block
//             ? PositionFactory.merge(classToken.position, block.position)
//             : classToken.position;
//         // TODO: check that statements are declarations.
//         return new ClassDeclaration(
//             position,
//             new Declarator(id.position, id.name),
//             block?.statements as Declaration[] ?? [],
//         );
//     }

// }