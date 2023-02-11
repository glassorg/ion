import { Declaration } from "./Declaration";
import { Declarator } from "./Declarator";

export class ForVariantDeclaration extends Declaration {

    constructor(id: Declarator) {
        super(id.location, id);
    }

    toString(includeTypes = true): string {
        return this.id.toString();
    }

}