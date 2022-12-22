import { SourceLocation } from "../ast/SourceLocation"
import * as Colors from "./Colors"

function pad(text: string, length: number, insert: string = " ") {
    while (text.length < length) {
        text = insert + text;
    }
    return text;
}

function isCloseLine(a?: SourceLocation, b?: SourceLocation, maxDiff = 5) {
    return a && b
        && a.filename == b.filename
        && a.startLine === a.finishLine
        && b.startLine === b.finishLine
        && Math.abs(a.startLine - b.startLine) <= maxDiff;
}

export default class ErrorContext
{

    constructor(
        public readonly source: string,
        public readonly filename: string,
        private readonly lines = source.split(/\n/g)
    ) {
    }

    wrapErrorLine(lineNumber: number, errorLocation: SourceLocation, start: string, finish: string, lineText: string | undefined = this.lines[lineNumber]) {
        if (lineText == null) {
            return undefined;
        }
        if (lineNumber < errorLocation.startLine || lineNumber > errorLocation.finishLine) {
            return lineText;
        }
        if (lineNumber > errorLocation.startLine && lineNumber < errorLocation.finishLine) {
            return start + lineText + finish;
        }
        let startIndex = lineNumber == errorLocation.startLine ? errorLocation.startColumn + 1 : 0;
        let endIndex = lineNumber == errorLocation.finishLine ? errorLocation.finishColumn + 1 : lineText.length + 1;
        if (startIndex >= lineText.length) {
            //  error is at finish of file.
            let append = Colors.Dim + " ";
            lineText += append;
            endIndex = startIndex + append.length;
        }
        if (startIndex == endIndex) {
            endIndex += 1;
        }
        let result = lineText.substring(0, startIndex - 1) + start + lineText.substring(startIndex - 1, endIndex - 1) + finish + lineText.substring(endIndex - 1);
        return result;
    }

    getLinesWithNumbers(startLine: number, endLine: number, ...errorLocations: SourceLocation[]): [number, string] {
        if (errorLocations.length > 1) {
            errorLocations.sort((a, b) => b.startColumn - a.startColumn);
        }
        let lineDigits = Math.max(Math.max(0, startLine).toString().length, endLine.toString().length);
        let linePrefix = "| ";
        let lines = new Array<string>();
        for (let i = startLine; i <= endLine; i++) {
            let line: string | undefined = undefined;
            for (let errorLocation of errorLocations) {
                line = this.wrapErrorLine(i, errorLocation, Colors.BgMagenta, Colors.Reset, line);
            }
            if (line != null) {
                lines.push(Colors.Dim + pad((i + 1).toString(), lineDigits) + linePrefix + Colors.Reset + line);
            }
        }
        return [lineDigits + linePrefix.length, lines.join('\n')];
    }

    getError(errorDescription: string, ...locations: SourceLocation[]) {
        let message = errorDescription + "\n";
        locations = locations.filter(Boolean);
        for (let i = 0; i < locations.length; i++) {
            let location = locations[i];
            let { filename } = location;
            let combineLocations = [location];
            while (isCloseLine(location, locations[i + 1])) {
                combineLocations.push(locations[++i]);
            }
            let startLine = Math.min(...combineLocations.map(l => l.startLine));
            let endLine = Math.max(...combineLocations.map(l => l.finishLine));
            let extraLines = locations.length > 1 ? 1 : 2;
            // maybe add more locations if they're on the same line
            let [padLength, errorLines] = this.getLinesWithNumbers(startLine - extraLines, endLine + extraLines, ...combineLocations);
            message +=
                "\n" +
                Colors.Dim + pad("", padLength - 1, "/") + " " + filename + "\n" + Colors.Reset +
                errorLines + "\n";
        }

        let error: any = new Error(message);
        error.description = errorDescription;
        error.location = locations[0];
        error.locations = locations;
        return error;
    }

}