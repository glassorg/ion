import * as HtmlLogger from "./HtmlLogger";
import * as common from "./common";
import { Assembly } from "./ast";
import { Options } from "./ast/Assembly";
import phases from "./phases";
import Parser = require("./parser");

type Logger = (names?: string | string[], ast?: any) => void

export default class Compiler {

    logger: Logger

    constructor(logger: Logger = HtmlLogger.create("./output.html")) {
        this.logger = logger
    }

    compile(options: Options) {
        let parser = Parser()
        let assembly = new Assembly({ _parser: parser, options: options, modules: new Map() })
        this.logger("Input", assembly)
        try {

            for (let phase of phases) {
                phase(assembly)
                this.logger(phase.name, assembly)
            }
            this.logger("Output", assembly)

            // // state = toJavascriptAst(state)
            // // this.logger("ToJavascriptAst", state)
            // // state = toJavascriptFiles(state, options)
            // // this.logger("ToJavascriptFiles", state)
            // // this.logger("Output", state)
            // // state = fileWriter(state, options)
        }
        catch (e) {
            let location = e.location
            if (location == null)
                throw e
            let { filename } = location
            let source = assembly._inputFiles!.get(filename)!
            let error = parser.getError(e.message, location, source, filename)
            console.log(error.message)
        }
        this.logger()
    }

}