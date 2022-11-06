import { Immutable } from "../Immutable";
import { InfixOperator } from "../Operators";

export class AstNode extends Immutable {

    constructor(
        public readonly position: number
    ) {
        super();
    }

    split(operator: InfixOperator): AstNode[] {
        let expressions: AstNode[] = [];
        for (let expression of this.splitInternal(operator)) {
            expressions.push(expression);
        }
        return expressions;
    }

    *splitInternal(operator: InfixOperator): Generator<AstNode> {
        yield this;
    }

    toJSON() {
        let { position, ...rest } = super.toJSON();
        return rest;
    }

}