import Patch from "../Patch";
import Node from "./Node";

export default class Id extends Node {

    name!: String

    constructor(values: Patch<Id>) {
        super(values)
    }

}