import { create as createDiffLogger, LogFunction } from "@glas/diff-logger";
import { ISONDebug } from "./ast/AstSerializers";

export type Logger = LogFunction;

export function createLogger(debugPattern?: RegExp): LogFunction {
    if (!debugPattern) {
        return () => {};
    }
    const diffLogger = createDiffLogger("./output.html");
    return (stepName?: string | string[], stepState?: string | object, channel?: string) => {
        if (!channel || debugPattern.test(channel)) {
            if (channel) {
                diffLogger(stepName, stepState?.toString(), `${channel}!`);
            }
            if (stepState === undefined) {
                diffLogger(stepName, ISONDebug.stringify(stepState), channel);
            }
            else {
                diffLogger(stepName, ISONDebug.stringify(stepState), channel);
            }
        }
    }
}
