import { Expression } from "./Expression";
import * as kype from "@glas/kype";
import { SemanticError } from "../SemanticError";

export abstract class Type extends Expression {

    public toKype(): kype.TypeExpression {
        throw new SemanticError(`${this.constructor.name}.toKype not implemented`);
    }

}

