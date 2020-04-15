import Node, { is } from "./Node";

export default class Id extends Node {

    name!: string

    static is(node): node is Id {
        return is(node, this)
    }

}