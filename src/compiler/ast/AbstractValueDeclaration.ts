import { Position, PositionFactory } from "../PositionFactory";
import { TokenNames } from "../tokenizer/TokenTypes";
import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";
import { TypeExpression } from "./TypeExpression";

/**
 * Base class for declarations which define runtime values.
 */
export abstract class AbstractValueDeclaration extends Declaration {

    constructor(
        position: Position,
        id: Declarator,
        public readonly valueType: TypeExpression | null,
    ) {
        super(position, id);
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