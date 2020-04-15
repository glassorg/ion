import Scope from "./Scope";
import Module from "./Module";
import Node from "./Node";

export default class Assembly extends Node {

    modules!: { [name: string]: Module }

    constructor(...args: Readonly<Assembly>[]) {
        super(...args)
    }

}