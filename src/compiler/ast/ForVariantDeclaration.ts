import { AbstractValueDeclaration } from "./AbstractValueDeclaration";
import { Declarator } from "./Declarator";

export class ForVariantDeclaration extends AbstractValueDeclaration {

    constructor(id: Declarator) {
        super(id.location, id, null);
    }

}