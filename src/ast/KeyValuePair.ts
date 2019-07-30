import Id from "./Id";
import Expression from "./Expression";
import Node from "./Node";

export default class KeyValuePair extends Node {

    key!: Expression | Id
    value!: Expression

}