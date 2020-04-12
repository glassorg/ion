import Scope from "./Scope";
import Module from "./Module";
import File from "./File";
import { foo } from "../experiment/Point";
import Declaration from "./Declaration";

export type Options = {
    input: string
    output: string
}

export type Parser = {
    parse(source: string, filename: string): any
    getError(message: string, location: string, source: string, filename: string): Error
}

export default class Assembly extends Scope {

    modules!: { [name: string]: Module }

    constructor(...args: Readonly<Assembly>[]) {
        super(...args)
    }

}