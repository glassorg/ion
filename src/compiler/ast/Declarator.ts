import { Identifier } from "./Identifier";

export class Declarator extends Identifier {

    public get isDeclarator() {
        return true;
    }

}