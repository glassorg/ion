import { Position } from "../PositionFactory";
import { BlockStatement } from "./BlockStatement";
import { Declarator } from "./Declarator";
import { Expression } from "./Expression";
import { ForVariantDeclaration } from "./ForVariantDeclaration";

export class ForStatement extends BlockStatement {

    constructor(
        position: Position,
        left: Declarator,
        public readonly right: Expression,
        body: BlockStatement,
    ){
        super(position, [
            new ForVariantDeclaration(left),
            body
        ]);
    }

    get left(): ForVariantDeclaration {
        return this.statements[0] as ForVariantDeclaration;
    }

    get body(): BlockStatement {
        return this.statements[1] as BlockStatement;
    }

}