import { strict as assert } from "assert";
import { PositionFactory } from "../PositionFactory";
import { Tokenizer } from "./Tokenizer";
import { tokenTypes } from "./tokenTypes";

const tokenizer = new Tokenizer(tokenTypes, new PositionFactory());

const tokens = tokenizer.tokenize(
    "test", `
foo(1, 2) + "bar"
`
)

assert.deepEqual(
    tokens.map(t => ({ ...t, position: PositionFactory.toObject(t.position)} )),
    [
        {
            "type": "Eol",
            "value": "\n",
            "position": {
                "fileId": 0,
                "line": 0,
                "column": 0,
                "length": 1
            }
        },
        {
            "type": "Id",
            "value": "foo",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 0,
                "length": 3
            }
        },
        {
            "type": "OpenParen",
            "value": "(",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 3,
                "length": 1
            }
        },
        {
            "type": "Integer",
            "value": "1",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 4,
                "length": 1
            }
        },
        {
            "type": "Operator",
            "value": ",",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 5,
                "length": 1
            }
        },
        {
            "type": "Whitespace",
            "value": " ",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 6,
                "length": 1
            }
        },
        {
            "type": "Integer",
            "value": "2",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 7,
                "length": 1
            }
        },
        {
            "type": "CloseParen",
            "value": ")",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 8,
                "length": 1
            }
        },
        {
            "type": "Whitespace",
            "value": " ",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 9,
                "length": 1
            }
        },
        {
            "type": "Operator",
            "value": "+",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 10,
                "length": 1
            }
        },
        {
            "type": "Whitespace",
            "value": " ",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 11,
                "length": 1
            }
        },
        {
            "type": "String",
            "value": "\"bar\"",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 12,
                "length": 5
            }
        },
        {
            "type": "Eol",
            "value": "\n",
            "position": {
                "fileId": 0,
                "line": 1,
                "column": 17,
                "length": 1
            }
        }
    ]
);
