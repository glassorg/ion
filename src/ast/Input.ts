import Scope from "./Scope";
import Module from "./Module";
import Node from "./Node";

export default class Input extends Node {

    modules!: { [name: string]: Module }

    constructor(...args: Readonly<Input>[]) {
        super(...args)
    }

}