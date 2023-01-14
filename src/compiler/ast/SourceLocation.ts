import { Immutable } from "./Immutable";

export class SourceLocation extends Immutable {

    constructor(
        public readonly filename: string,
        public readonly startIndex: number,
        public readonly startLine: number,
        public readonly startColumn: number,
        public readonly finishIndex: number,
        public readonly finishLine: number,
        public readonly finishColumn: number
    ) {
        super();
    }

    public static empty = new SourceLocation("empty", 0, 0, 0, 0, 0, 0);

    merge(b?: SourceLocation): SourceLocation {
        return b ? SourceLocation.merge(this, b) : this;
    }

    public static merge(a: SourceLocation, b: SourceLocation) {
        let minStart = (a.startLine < b.startLine || (a.startLine === b.startLine && a.startColumn < b.startColumn)) ? a : b;
        let { startIndex, startLine, startColumn } = minStart;
        let maxFinish = (a.finishLine < b.finishLine || (a.finishLine === b.finishLine && a.finishColumn < b.finishColumn)) ? b : a;
        let { finishIndex, finishLine, finishColumn } = maxFinish;
        return new SourceLocation(a.filename, startIndex, startLine, startColumn, finishIndex, finishLine, finishColumn);
    }

}