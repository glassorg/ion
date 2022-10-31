import { strict as assert } from "assert";
import { Position, PositionFactory } from "./PositionFactory";

function testPositionRoundtrip(
    setFunc: (position: Position, value: number) => Position,
    getFunc: (position: Position) => Position,
    expected: number
) {
    let position = setFunc(0, expected);
    let actual = getFunc(position);
    assert.equal(actual, expected);
}

testPositionRoundtrip(PositionFactory.setColumn, PositionFactory.getColumn, 12);
testPositionRoundtrip(PositionFactory.setFileId, PositionFactory.getFileId, 7);
testPositionRoundtrip(PositionFactory.setLine, PositionFactory.getLine, 1023);
testPositionRoundtrip(PositionFactory.setLength, PositionFactory.getLength, 1);
