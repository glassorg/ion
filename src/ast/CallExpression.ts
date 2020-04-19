import Expression from "./Expression";
import KeyValuePair from "./KeyValuePair";

export default class CallExpression extends Expression {

    new?: boolean
    callee!: Expression
    arguments!: Array<KeyValuePair | Expression>

}