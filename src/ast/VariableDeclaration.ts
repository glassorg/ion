import Variable from "./Variable";
import Declaration from "./Declaration";
import { mixin } from "./runtime";
import Node from "./Node";
import Id from "./Id";

export default class VariableDeclaration extends Variable implements Declaration {
}
mixin(VariableDeclaration, Declaration)
