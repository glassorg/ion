import { AstNode } from "../../ast/AstNode";
import { Declarator } from "../../ast/Declarator";
import { Token } from "../../ast/Token";
import { TokenNames } from "../tokenizer/TokenTypes";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { SemanticError } from "../../SemanticError";
import { FunctionExpression } from "../../ast/FunctionExpression";
import { PstGroup } from "../../ast/PstGroup";
import { Expression } from "../../ast/Expression";
import { splitExpressions } from "../../ast/AstFunctions";
import { FunctionDeclaration } from "../../ast/FunctionDeclaration";

export class FunctionParselet extends PrefixParselet {

    parse(p: Parser, functionToken: Token): AstNode {
        let id = p.consumeOne(TokenNames.Id, TokenNames.EscapedId);
        let absolute = id.type === TokenNames.EscapedId; 
        if (absolute) {
            // hack to fix escaped id
            id = id.patch({ value: id.value.slice(1, -1) });
        }
        p.whitespace();
        // let block = p.maybeParseBlock();
        let value: Expression | undefined = p.parseExpression();

        let functionExpression: FunctionExpression;
        if (value instanceof PstGroup) {
            let body = p.parseBlock();
            functionExpression = FunctionExpression.createFromLambda(value, body);

            // let type = value.type;
            // let exact = value.exactType;
            // value = value.value;
            // let parameters = splitExpressions(",", value).map(FunctionExpression.parameterFromNode) ?? [];
            // let location = functionToken.location.merge(body.location);
            // functionExpression = new FunctionExpression(location, parameters, body, type);
            // if (exact) {
            //     functionExpression = functionExpression.patch({ returnTypeExact: exact });
            // }
        }
        else if (value instanceof FunctionExpression) {
            // console.log(value.toString());
            functionExpression = value;
            // throw new SemanticError(`Lambda Function not supported yet`, value);
        }
        else {
            throw new SemanticError(`Expected FunctionExpression`, value);
        }
        //  legacy function expression format with () => value
        let location = functionToken.location.merge(value?.location);
        return new FunctionDeclaration(location, new Declarator(id.location, id.value), functionExpression);
    }

}
