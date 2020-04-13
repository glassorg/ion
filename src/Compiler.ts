import * as HtmlLogger from "./HtmlLogger";
import * as common from "./common";
import { Assembly } from "./ast";
import phases from "./phases";
import Parser = require("./parser");

type Logger = (names?: string | string[], ast?: any) => void

export class Options {

    input: string
    output: string
    parser!: ReturnType<typeof Parser>

    constructor(input: string, output: string) {
        this.input = input
        this.output = output
    }

}

export default class Compiler {

    logger: Logger

    constructor(logger: Logger = HtmlLogger.create("./output.html")) {
        this.logger = logger
    }

    compile(options: Options) {
        options.parser = Parser()
        let files = common.getInputFilesRecursive(options.input)
        let root: any = files
        this.logger("Input", root)
        try {

            for (let phase of phases) {
                root = phase(root, options) || root
                this.logger(phase.name, root)
            }
            this.logger("Output", root)
        }
        catch (e) {
            let location = e.location
            if (location == null || location.start == null)
                throw e
            let { filename } = location
            let source = files[filename]!
            let error = options.parser.getError(e.message, location, source, filename)
            console.log(error.message)
        }
        this.logger()
    }

}