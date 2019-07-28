import phases from "./phases";
import * as HtmlLogger from "./HtmlLogger";

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
        for (let phase of phases) {
            state = phase(state)
            this.logger(phase.name, state)
            console.log(phase.name, state)
        }
        this.logger()
    }

}