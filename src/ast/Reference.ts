import Id from "./Id";
import Expression from "./Expression";
import { mixin } from "./runtime";
import { is } from "./Node";
import Location from "./Location";

export default class Reference extends Id implements Expression {

    constructor(...args: Readonly<Reference>[]) {
        super(...args)
    }

    static is(node): node is Reference {
        return is(node, this)
    }

}

mixin(Reference, Expression)