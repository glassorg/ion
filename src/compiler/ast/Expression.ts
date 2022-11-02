import { InfixOperator } from "../Operators";
import { AstNode } from "./AstNode";

export class Expression extends AstNode {

    split(operator: InfixOperator): Expression[] {
        let expressions: Expression[] = [];
        for (let expression of this.splitInternal(operator)) {
            expressions.push(expression);
        }
        return expressions;
    }

    *splitInternal(operator: InfixOperator): Generator<Expression> {
        yield this;
    }
}
