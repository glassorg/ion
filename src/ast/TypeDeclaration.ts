import VariableDeclaration from "./VariableDeclaration";
import { mixin } from "./runtime";
import { is } from "./Node";

export default class TypeDeclaration extends VariableDeclaration {

    static is(node): node is TypeDeclaration {
        return is(node, this)
    }

}
