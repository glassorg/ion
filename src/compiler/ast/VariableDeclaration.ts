import { Position, PositionFactory } from "../PositionFactory";
import { TokenNames } from "../tokenizer/TokenTypes";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { TypeExpression } from "./TypeExpression";

export class VariableDeclaration extends AbstractValueDeclaration {

    constructor(
        position: Position,
        id: Declarator,
        valueType: TypeExpression | null,
        public readonly defaultValue: Expression | null,
    ){
        super(position, id, valueType);
    }

    getVarTokenPosition(): Position | null {
        let ths = PositionFactory.toObject(this.position);
        let id = PositionFactory.toObject(this.id.position);
        if (ths.line == id.line && ths.column == id.column) {
            return null;
        }
        return PositionFactory.create(ths.fileId, ths.line, ths.column, TokenNames.Var.length);
    }

}