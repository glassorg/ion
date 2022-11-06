import { Position } from "../PositionFactory";
import { BlockStatement } from "./BlockStatement";
import { Expression } from "./Expression";
import { ParameterDeclaration } from "./ParameterDeclaration";

export class FunctionExpression extends Expression {

    constructor(
        position: Position,
        public readonly parameters: ParameterDeclaration[],
        public readonly body: BlockStatement,
    ) {
        super(position);
    }

}