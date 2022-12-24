import { StructDeclaration } from "./StructDeclaration";

export class ClassDeclaration extends StructDeclaration {

    get keyword() {
        return "class";
    }

}