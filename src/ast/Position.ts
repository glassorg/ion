/*
This file was generated from ion source. Do not edit.
*/
import * as Number from './ion/Number';
import * as Class from './ion/Class';
export class Position {
    readonly line: Number.Number;
    readonly column: Number.Number;
    constructor(line: Number.Number, column: Number.Number) {
        if (!Number.isNumber(line))
            throw new Error('line is not a Number: ' + Class.toString(line));
        if (!Number.isNumber(column))
            throw new Error('column is not a Number: ' + Class.toString(column));
        this.line = line;
        this.column = column;
        Object.freeze(this);
    }
    static is(value): value is Position {
        return isPosition(value);
    }
}
Position['id'] = 'Position';
Position['implements'] = new Set(['Position']);
export const isPosition = function (value): value is Position {
    return Class.isInstance(Position, value);
};
export default Position;