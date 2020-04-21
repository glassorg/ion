import * as HtmlLogger from "./HtmlLogger";
import * as common from "./common";
import { Assembly } from "./ast";
import frontPhases from "./phases";
import * as targets from "./targets";
import Parser = require("./parser");

type Logger = (names?: string | string[], ast?: any) => void

export class Options {

    inputs: string[]
    output: string
    target: "typescript" = "typescript"
    parser!: ReturnType<typeof Parser>

    constructor(inputs: string[], output: string) {
        this.inputs = inputs
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
        let files = common.getInputFilesRecursive(options.inputs)
        let root: any = files
        let backPhases = targets[options.target]
        let phases = [...frontPhases, ...backPhases]
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