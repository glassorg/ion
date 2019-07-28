import Id from "./Id";
import Expression from "./Expression";

export default class KeyValuePair extends Node {

    key!: Expression | Id
    value!: Expression

}