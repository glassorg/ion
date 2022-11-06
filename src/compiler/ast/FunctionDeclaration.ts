import { Position } from "../PositionFactory";
import { ConstantDeclaration } from "./ConstantDeclaration";
import { Declarator } from "./Declarator";
import { FunctionExpression } from "./FunctionExpression";

export class FunctionDeclaration extends ConstantDeclaration {

    constructor(
        position: Position,
        id: Declarator,
        value: FunctionExpression,
    ){
        super(position, id, value);
    }

}