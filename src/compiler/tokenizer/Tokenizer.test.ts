import { strict as assert } from "assert";
import { Tokenizer } from "./Tokenizer";
import { TokenTypes } from "./TokenTypes";

const tokenizer = new Tokenizer(TokenTypes);

const tokens = tokenizer.tokenize(
    "test", `
foo(1, 2) + "bar"
`
)

assert.deepEqual(
    JSON.parse(JSON.stringify(tokens.map(t => ({...t})), null, 4)),
    [
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 0,
                "startLine": 0,
                "startColumn": 0,
                "finishIndex": 1,
                "finishLine": 0,
                "finishColumn": 1
            },
            "type": "Eol",
            "value": "\n"
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 1,
                "startLine": 1,
                "startColumn": 0,
                "finishIndex": 4,
                "finishLine": 1,
                "finishColumn": 3
            },
            "type": "Id",
            "value": "foo"
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 4,
                "startLine": 1,
                "startColumn": 3,
                "finishIndex": 5,
                "finishLine": 1,
                "finishColumn": 4
            },
            "type": "OpenParen",
            "value": "("
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 5,
                "startLine": 1,
                "startColumn": 4,
                "finishIndex": 6,
                "finishLine": 1,
                "finishColumn": 5
            },
            "type": "Integer",
            "value": "1"
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 6,
                "startLine": 1,
                "startColumn": 5,
                "finishIndex": 7,
                "finishLine": 1,
                "finishColumn": 6
            },
            "type": "Operator",
            "value": ","
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 7,
                "startLine": 1,
                "startColumn": 6,
                "finishIndex": 8,
                "finishLine": 1,
                "finishColumn": 7
            },
            "type": "Whitespace",
            "value": " "
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 8,
                "startLine": 1,
                "startColumn": 7,
                "finishIndex": 9,
                "finishLine": 1,
                "finishColumn": 8
            },
            "type": "Integer",
            "value": "2"
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 9,
                "startLine": 1,
                "startColumn": 8,
                "finishIndex": 10,
                "finishLine": 1,
                "finishColumn": 9
            },
            "type": "CloseParen",
            "value": ")"
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 10,
                "startLine": 1,
                "startColumn": 9,
                "finishIndex": 11,
                "finishLine": 1,
                "finishColumn": 10
            },
            "type": "Whitespace",
            "value": " "
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 11,
                "startLine": 1,
                "startColumn": 10,
                "finishIndex": 12,
                "finishLine": 1,
                "finishColumn": 11
            },
            "type": "Operator",
            "value": "+"
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 12,
                "startLine": 1,
                "startColumn": 11,
                "finishIndex": 13,
                "finishLine": 1,
                "finishColumn": 12
            },
            "type": "Whitespace",
            "value": " "
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 13,
                "startLine": 1,
                "startColumn": 12,
                "finishIndex": 18,
                "finishLine": 1,
                "finishColumn": 17
            },
            "type": "String",
            "value": "\"bar\""
        },
        {
            "location": {
                "": "SourceLocation",
                "filename": "test",
                "startIndex": 18,
                "startLine": 1,
                "startColumn": 17,
                "finishIndex": 19,
                "finishLine": 1,
                "finishColumn": 18
            },
            "type": "Eol",
            "value": "\n"
        }
    ]
);
