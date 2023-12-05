
export type Config = {
    input: Record<string, string>;
    output: {
        path: string;
        jsonschema: boolean;
        typescript: boolean;
    }
}

export function commandLine(config: Config) {
    console.log(`Command Line Compiler`, config);
    // TODO: Start building the compiler from here.
}