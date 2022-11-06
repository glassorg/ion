
import { AstNode } from "../ast/AstNode";
import { BlockStatement } from "../ast/BlockStatement";
import { Declaration } from "../ast/Declaration";
import { Expression } from "../ast/Expression";
import { PstModule } from "../ast/PstModule";
import { Statement } from "../ast/Statement";
import { Token } from "../ast/Token";
import { PositionFactory } from "../PositionFactory";
import { SemanticError } from "../SemanticError";
import { Tokenizer } from "../tokenizer/Tokenizer";
import { TokenName, TokenNames, TokenTypes } from "../tokenizer/TokenTypes";
import { InfixParselet } from "./InfixParslet";
import { PrefixParselet } from "./PrefixParselet";

export class Parser {

    private tokens: Token[] = [];
    private parseOutline = true;
    public readonly tokenizer: Tokenizer;

    constructor(
        public readonly prefixParselets: { [key in TokenName]?: PrefixParselet },
        public readonly infixParselets: { [key in TokenName]?: InfixParselet },
        public readonly positionFactory: PositionFactory = new PositionFactory(),
    ) {
        this.prefixParselets = prefixParselets;
        this.infixParselets = infixParselets;
        this.tokenizer = new Tokenizer(TokenTypes, positionFactory);
    }

    maybeConsume(tokenType?: string, value?: any): Token | undefined
    maybeConsume(tokenType?: string[], value?: any): Token | undefined
    maybeConsume(tokenType?: string | string[], value?: any): Token | undefined {
        for (let type of Array.isArray(tokenType) ? tokenType : [tokenType]) {
            let result = this.consumeInternal(type, value, false);
            if (result != null) {
                return result;
            }
        }
        return undefined;
    }

    consume(tokenType?: string, value?: any): Token {
        return this.consumeInternal(tokenType, value, true)!;
    }

    private consumeInternal(tokenType?: string, value?: any, required = true): Token | null {
        let token = this.peek();
        if (token == null) {
            if (required) {
                throw new Error(`Unexpected EOF`);
            }
            else {
                return null;
            }
        }
        if (tokenType != null && token.type !== tokenType) {
            if (required) {
                throw new SemanticError(`Expected: ${tokenType}`, token);
            }
            else {
                return null;
            }
        }
        if (value !== undefined && token.value !== value) {
            if (required) {
                throw new SemanticError(`Expected: ${value}`, token.position);
            }
            else {
                return null;
            }
        }
        this.tokens.pop();
        return token;
    }

    done() {
        return this.tokens.length === 0;
    }

    peek(tokenType?: string, offset = 0): Token | null {
        let token = this.tokens[this.tokens.length - 1 - offset];
        if (token != null && (tokenType == null || tokenType === token.type)) {
            return token;
        }
        return null;
    }

    setSource(filename: string, source: string) {
        const tokens = this.tokenizer.tokenize(filename, source);
        this.setTokens(tokens);
        this.eol();
    }

    setTokens(tokens: Token[]): this {
        this.tokens = [...tokens].reverse();
        return this;
    }

    parseModule(filename: string, source: string): PstModule {
        this.setSource(filename, source);

        let statements = new Array<Declaration>();
        while (!this.done()) {
            this.whitespace();
            let statement = this.parseStatement();
            if (!(statement instanceof Declaration)) {
                throw new SemanticError(`Only declarations are allowed within the module scope`, statement);
            }
            statements.push(statement);
            this.eol();
        }

        if (!this.done()) {
            throw new SemanticError(`Expected EOL or EOF`, this.peek()?.position);
        }

        return new PstModule(
            statements.length > 0
                ? PositionFactory.merge(statements[0].position, statements[statements.length - 1].position)
                : this.positionFactory.create(filename, 0, 0, 0),
            filename,
            statements,
        )
    }

    maybeParseBlock() : BlockStatement | null {
        if (this.parseOutline && this.peek(TokenNames.Eol, 0) && this.peek(TokenNames.Indent, 1)) {
            return this.parseBlock();
        }
        else {
            return null;
        }
    }

    parseBlock(indent = (this.eol(1), this.consume(TokenNames.Indent))): BlockStatement {
        let nodes = new Array<AstNode>();
        let outdent: Token | undefined;
        this.eol();

        while (!this.done()) {
            this.whitespace();
            nodes.push(this.maybeParseBlock() || this.parseNode());
            this.eol();
            if (outdent = this.maybeConsume(TokenNames.Outdent)) {
                break;
            }
        }

        return new BlockStatement(
            PositionFactory.merge(indent.position, outdent!.position),
            nodes as Statement[],
        )
    }

    eol(min = 0) {
        let count = 0;
        this.whitespace();
        this.maybeConsume(TokenNames.Comment);
        while (this.maybeConsume(TokenNames.Eol)) {
            count++;
            this.whitespace();
            this.maybeConsume(TokenNames.Comment);
        }
        if (count < min) {
            throw new SemanticError(`Expected EOL`, this.peek()!.position);
        }
        return count;
    }

    whitespace() {
        let result: Token | undefined = undefined;
        while (true) {
            let whitespace = this.maybeConsume(TokenNames.Whitespace);
            if (whitespace) {
                result = whitespace;
            }
            else {
                break;
            }
        }
        return result;
    }

    parseInlineExpression(precedence: number = 0): Expression {
        let save = this.parseOutline;
        this.parseOutline = false;
        let result = this.parseNode(precedence);
        this.parseOutline = save;
        if (!(result instanceof Expression)) {
            throw new SemanticError(`Expected Expression`, result);
        }
        return result;
    }

    parseExpression(precedence: number = 0): Expression {
        let node = this.parseNode(precedence);

        if (!(node instanceof Expression)) {
            throw new SemanticError(`Expected Expression`, node);
        }

        return node;
    }

    parseStatement(): Statement {
        let node = this.parseNode();

        if (!(node instanceof Statement)) {
            throw new SemanticError(`Expected Statement`, node);
        }

        return node;
    }

    parseNode(precedence: number = 0): AstNode {
        let token = this.consume();
        this.whitespace();
        let prefix = this.prefixParselets[token.type as TokenName];
        if (prefix == null) {
            throw new SemanticError(`Could not parse: ${token.type}(${token.value})`);
        }
        let left = prefix.parse(this, token);

        while (true) {
            this.whitespace();
            let next = this.peek();
            if (next != null) {
                let infix = this.infixParselets[next.type as TokenName];
                if (infix != null && precedence < (infix.getPrecedence(next) ?? 0)) {
                    this.consume();
                    this.whitespace();
                    left = infix.parse(this, left, next);
                    continue;
                }
            }
            break;
        }

        return left;
    }

}