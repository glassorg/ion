import { VariableDeclaration } from "./VariableDeclaration";

export class ParameterDeclaration extends VariableDeclaration {

    get keyword() {
        return `param`;
    }

}