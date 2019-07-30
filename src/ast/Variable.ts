import Id from "./Id";
import Expression from "./Expression";
import Node from "./Node";

export default class Variable extends Node {

    id!: Id
    type?: Expression
    value?: Expression
    assignable?: boolean

}