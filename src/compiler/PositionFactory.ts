
//  shared buffers to convert from 4 U16 to/from a F64
const floatArray = new Float64Array(1);
const shortArray = new Uint16Array(floatArray.buffer);

function getBits(index: number, value: Position) {
    floatArray[0] = value;
    return shortArray[index];
}
function setBits(index: number, position: Position, value: number) {
    if (value >= 0x10000 || value < 0) {
        throw new Error(`Value out of max range: ${value}`);
    }
    floatArray[0] = position;
    shortArray[index] = value;
    return floatArray[0];
}

export type Position = number;

/**
 * Contains functions for encoding and decoding file source positions within a single number.
 */
export class PositionFactory {
    
    private filesToId = new Map<string, Position>();
    private idToFile = new Map<Position, string>();

    create(file: string, line: number, column: number, length: number) {
        let fileId = this.filesToId.get(file);
        if (fileId === undefined) {
            fileId = this.filesToId.size;
            this.filesToId.set(file, fileId);
            this.idToFile.set(fileId, file);
        }
        return PositionFactory.create(fileId, line, column, length);
    }

    static create(fileId: number, line: number, column: number, length: number) {
        return (
            this.setFileId(
                this.setLine(
                    this.setColumn(
                        this.setLength(0, length),
                        column
                    ),
                    line
                ),
                fileId
            )
        )
    }

    static toObject(a: Position) {
        return {
            fileId: this.getFileId(a),
            line: this.getLine(a),
            column: this.getColumn(a),
            length: this.getLength(a)
        }
    }

    static merge(a: Position, b: Position): Position {
        return PositionFactory.setLength(a, this.getLength(a) + this.getLength(b));
    }

    static readonly getFileId = getBits.bind(null, 0);
    static readonly setFileId = setBits.bind(null, 0);
    static readonly getLine = getBits.bind(null, 1);
    static readonly setLine = setBits.bind(null, 1);
    static readonly getColumn = getBits.bind(null, 2);
    static readonly setColumn = setBits.bind(null, 2);
    static readonly getLength = getBits.bind(null, 3);
    static readonly setLength = setBits.bind(null, 3);

}
