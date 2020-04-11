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

    _parser!: Parser
    options!: Options
    modules!: Map<string, Module>
    declarations!: Map<string, Declaration>
    _inputFiles: Map<string, string>
    _outputFiles: Map<string, string>

    constructor(...args) {
        super(...args)
        this.declarations = new Map()
        this._inputFiles = new Map()
        this._outputFiles = new Map()
    }

}