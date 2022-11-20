import { create as createDiffLogger, LogFunction } from "@glas/diff-logger";

export type Logger = LogFunction;

export function createLogger(...debugFiles: string[]): LogFunction {
    if (debugFiles.length === 0) {
        return () => {};
    }
    const diffLogger = createDiffLogger("./output.html");
    return (stepName?: string | string[], stepState?: string | object, channel?: string) => {
        if (!channel || debugFiles.includes(channel)) {
            if (channel) {
                diffLogger(stepName, stepState?.toString(), `${channel}!`);
            }
            diffLogger(stepName, stepState, channel);
        }
    }
}
