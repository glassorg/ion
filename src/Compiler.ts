import * as HtmlLogger from "./HtmlLogger";
import * as common from "./common";
import Parser from "./parser";
import importResolution from "./phases/importResolution";
import parsing from "./phases/parsing";
import typeNormalization from "./phases/typeNormalization";
import typeCreation from "./phases/typeCreation";
import toJavascriptAst from "./phases/toJavascriptAst";

type Logger = (names?: string | string[], ast?: any) => void

export type Input = {
    root: string
}

export default class Compiler {

    logger: Logger

    constructor(logger: Logger = HtmlLogger.create("./output.html")) {
        this.logger = logger
    }

    compile(input: Input) {
        let state: any = input
        this.logger("Input", state)
        let parser = Parser()
        let files = common.getFilesRecursive(input.root)
        try {
            state = parsing(input, files, parser)
            this.logger("Parsing", state)
            state = importResolution(state)
            this.logger("ImportResolution", state)
            state = typeNormalization(state)
            this.logger("Type Normalization", state)
            state = typeCreation(state)
            this.logger("Type Creation", state)
            state = toJavascriptAst(state)
            this.logger("ToJavascriptAst", state)
        }
        catch (e) {
            let location = e.location
            if (location == null)
                throw e
            let { filename } = location
            let source = files[filename]
            let error = parser.getError(e.message, location, source, filename)
            console.log(error.message)
        }
        this.logger()
    }

}