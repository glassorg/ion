import Id from "./Id";
import Expression from "./Expression";
import { mixin } from ".";

export default class Reference extends Id implements Expression {
}

mixin(Reference, Expression)