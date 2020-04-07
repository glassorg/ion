import Scope from "./Scope";
import Module from "./Module";
import File from "./File";
import { foo } from "../experiment/Point";

export type Options = {
    input: string
    output: string
}

export type Parser = {
    parse(source: string, filename: string): any
    getError(message: string, location: string, source: string, filename: string): Error
}

export default class Assembly extends Scope {

    parser!: Parser
    options!: Options
    modules!: Map<string, Module>
    inputFiles: Map<string, string>
    outputFiles: Map<string, string>

    constructor(...args) {
        super(...args)
        this.inputFiles = new Map()
        this.outputFiles = new Map()
    }

}