import * as HtmlLogger from "./HtmlLogger";
import * as common from "./common";
import Parser from "./parser";
import importResolution from "./phases/importResolution";
import parsing from "./phases/parsing";
import typeNormalization from "./phases/typeNormalization";
import typeCreation from "./phases/typeCreation";
import toJavascriptAst from "./phases/toJavascriptAst";
import toJavascriptFiles from "./phases/toJavascriptFiles";
import fileWriter from "./phases/fileWriter";

type Logger = (names?: string | string[], ast?: any) => void

export type Options = {
    input: string
    output: string
}

export default class Compiler {

    logger: Logger

    constructor(logger: Logger = HtmlLogger.create("./output.html")) {
        this.logger = logger
    }

    compile(options: Options) {
        let state: any = options
        this.logger("Options", state)
        let parser = Parser()
        let files = common.getFilesRecursive(options.input)
        try {
            state = parsing(options, files, parser)
            this.logger("Input", state)
            state = importResolution(state)
            this.logger("ImportResolution", state)
            state = typeNormalization(state)
            this.logger("Type Normalization", state)
            state = typeCreation(state)
            this.logger("Type Creation", state)
            state = toJavascriptAst(state)
            this.logger("ToJavascriptAst", state)
            state = toJavascriptFiles(state)
            this.logger("ToJavascriptFiles", state)
            this.logger("Output", state)
            state = fileWriter(state, options)
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