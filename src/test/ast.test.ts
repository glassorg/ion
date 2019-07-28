import { strict as assert } from "assert"

import VariableDeclaration from "../ast/VariableDeclaration";
import Node from "../ast/Node";
import Variable from "../ast/Variable";
import Declaration from "../ast/Declaration";
import UnaryExpression from "../ast/UnaryExpression";

let varDec = new VariableDeclaration({})
assert(Node.is(varDec))
assert(Variable.is(varDec))
assert(Declaration.is(varDec))
assert(VariableDeclaration.is(varDec))
assert(!UnaryExpression.is(varDec))
