import Id from "./Id";
import Expression from "./Expression";
import { mixin } from "./runtime";

export default class Reference extends Id implements Expression {
}

mixin(Reference, Expression)